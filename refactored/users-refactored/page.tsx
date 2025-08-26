'use client'

import { RoleGuard } from "@/components/ui/role-guard"
import { UserFilterPanel } from "@/components/user-management/UserFilterPanel"
import { UserTable } from "@/components/user-management/UserTable"
import { useUserManagement } from "@/hooks/useUserManagement"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Loader2 } from "lucide-react"

export default function UsersRefactoredPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <UsersRefactoredContent />
    </RoleGuard>
  )
}

function UsersRefactoredContent() {
  const {
    // State
    users,
    loading,
    formDialogOpen,
    formLoading,
    editUser,
    deleteId,
    deleteLoading,
    search,
    statusLoading,
    viewDetailsUser,
    optimisticStatus,
    
    // Computed values
    userStats,
    roleDistribution,
    statusDistribution,
    
    // Actions
    setFormDialogOpen,
    setDeleteId,
    setSearch,
    setViewDetailsUser,
    
    // Functions
    fetchUsers,
    openDialog,
    handleUserFormSubmit,
    handleDelete,
    handleToggleStatus,
    handleViewDetails
  } = useUserManagement()

  const handleSearchChange = (value: string) => {
    setSearch(value)
  }

  const handleRefresh = () => {
    fetchUsers()
  }

  const handleEdit = (user: any) => {
    openDialog(user)
  }

  const handleDeleteClick = (userid: number) => {
    setDeleteId(userid)
  }

  const handleConfirmDelete = () => {
    if (deleteId) {
      handleDelete(deleteId)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          គ្រប់គ្រងអ្នកប្រើ
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          គ្រប់គ្រងអ្នកប្រើប្រាស់ និងការអនុញ្ញាត
        </p>
      </div>

      <div className="space-y-6">
        {/* Filter Panel */}
        <UserFilterPanel
          userStats={userStats}
          search={search}
          loading={loading}
          onSearchChange={handleSearchChange}
          onRefresh={handleRefresh}
        />

        {/* Add User Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => openDialog()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            បន្ថែមអ្នកប្រើ
          </Button>
        </div>

        {/* User Table */}
        <UserTable
          users={users}
          loading={loading}
          statusLoading={statusLoading}
          onEdit={handleEdit}
          onViewDetails={handleViewDetails}
          onDelete={handleDeleteClick}
          onToggleStatus={handleToggleStatus}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null); }}>
          <DialogContent className="max-w-md w-full bg-gradient-to-br from-background to-muted/20 rounded-2xl shadow-2xl border-0 p-0">
            <Card className="w-full bg-transparent border-0 shadow-none">
              <CardHeader className="pb-4 border-b border-border/50 bg-background/80 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                      <Trash2 className="h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold tracking-wide text-red-600 dark:text-red-400">
                        លុបអ្នកប្រើ
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground mt-1">
                        សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ
                      </DialogDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="text-sm text-red-700 dark:text-red-300">
                      <p className="font-medium">តើអ្នកប្រាកដថាចង់លុបអ្នកប្រើនេះមែនទេ?</p>
                      <p className="text-xs mt-1 opacity-80">ព័ត៌មានទាំងអស់នឹងត្រូវបានលុបជាអចិន្ត្រៃយ៍</p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <DialogClose asChild>
                      <Button 
                        variant="outline" 
                        className="h-10 px-6 text-sm font-semibold hover:bg-muted/50 border-border/50"
                        disabled={deleteLoading}
                      >
                        បោះបង់
                      </Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={handleConfirmDelete}
                      disabled={deleteLoading}
                      className="h-10 px-6 text-sm font-bold bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {deleteLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          កំពុងលុប...
                        </>
                      ) : (
                        "លុបអ្នកប្រើ"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={!!viewDetailsUser} onOpenChange={open => { if (!open) setViewDetailsUser(null); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                ព័ត៌មានលម្អិតអ្នកប្រើ
              </DialogTitle>
            </DialogHeader>
            {viewDetailsUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">ព័ត៌មានផ្ទាល់ខ្លួន</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">ឈ្មោះ:</span> {viewDetailsUser.firstname} {viewDetailsUser.lastname}</p>
                      <p><span className="font-medium">ឈ្មោះអ្នកប្រើ:</span> @{viewDetailsUser.username}</p>
                      <p><span className="font-medium">តួនាទី:</span> {viewDetailsUser.position || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">ព័ត៌មានទំនាក់ទំនង</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">លេខទូរស័ព្ទ:</span> {viewDetailsUser.phonenumber1}</p>
                      <p><span className="font-medium">លេខទូរស័ព្ទទី២:</span> {viewDetailsUser.phonenumber2 || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">ស្ថានភាព</h4>
                    <div className="space-y-2">
                      <Badge className={viewDetailsUser.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {viewDetailsUser.status === 'active' ? 'សកម្ម' : 'អសកម្ម'}
                      </Badge>
                      <p><span className="font-medium">តួនាទី:</span> {viewDetailsUser.role === 'admin' ? 'អ្នកគ្រប់គ្រង' : 'គ្រូបង្រៀន'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">កាលបរិច្ឆេទ</h4>
                    <div className="space-y-2">
                      <p><span className="font-medium">បង្កើត:</span> {new Date(viewDetailsUser.createdAt).toLocaleDateString('km-KH')}</p>
                      <p><span className="font-medium">កែប្រែ:</span> {new Date(viewDetailsUser.updatedAt).toLocaleDateString('km-KH')}</p>
                      {viewDetailsUser.lastLogin && (
                        <p><span className="font-medium">ចូលចុងក្រោយ:</span> {new Date(viewDetailsUser.lastLogin).toLocaleDateString('km-KH')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">បិទ</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
