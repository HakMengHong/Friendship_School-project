'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { 
  Sun, 
  Moon, 
  Star, 
  Heart, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Users,
  Settings,
  Bell,
  Search,
  Download,
  Upload,
  Trash2,
  Edit,
  Eye,
  Plus,
  Minus,
  Palette,
  Tag,
  Table
} from "lucide-react"

export default function DarkModeDemoPage() {
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary dark:text-blue-400">
          Dark Mode Demo
        </h1>
        <p className="text-muted-foreground dark:text-slate-300 max-w-2xl mx-auto">
          This page demonstrates the comprehensive dark mode styling implemented across the entire interface. 
          Use the theme toggle in the top bar to switch between light and dark modes.
        </p>
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
      </div>

      {/* Color Palette */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Color Palette
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                Primary
              </div>
              <p className="text-sm text-center">Primary Color</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-secondary rounded-lg flex items-center justify-center text-secondary-foreground font-bold">
                Secondary
              </div>
              <p className="text-sm text-center">Secondary Color</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-muted rounded-lg flex items-center justify-center text-muted-foreground font-bold">
                Muted
              </div>
              <p className="text-sm text-center">Muted Background</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-destructive rounded-lg flex items-center justify-center text-destructive-foreground font-bold">
                Destructive
              </div>
              <p className="text-sm text-center">Destructive Color</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buttons */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Buttons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
              <Button disabled>Disabled</Button>
              <Button className="btn-primary">Custom Primary</Button>
              <Button className="btn-secondary">Custom Secondary</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                With Icon
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="ghost">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Elements */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Form Elements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter your name" className="input-modern" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" className="input-modern" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Enter your message" 
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Accept terms and conditions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="notifications" />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>
              <div>
                <Label>Gender</Label>
                <RadioGroup defaultValue="male" className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label>Progress</Label>
                <Progress value={65} className="mt-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards and Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1,234</p>
            <p className="text-sm text-muted-foreground">Active users</p>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(4.5/5)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Favorites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">89</p>
            <p className="text-sm text-muted-foreground">Liked items</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Alerts & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription>
                This is a success alert with a green checkmark icon.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This is a destructive alert with a red warning icon.
              </AlertDescription>
            </Alert>
            <Alert>
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription>
                This is an informational alert with a blue info icon.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Badges & Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge className="bg-green-500 hover:bg-green-600">Success</Badge>
            <Badge className="bg-yellow-500 hover:bg-yellow-600">Warning</Badge>
            <Badge className="bg-blue-500 hover:bg-blue-600">Info</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tabs className="h-5 w-5 text-primary" />
            Tabs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Enter username" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email" />
              </div>
            </TabsContent>
            <TabsContent value="password" className="space-y-4">
              <div>
                <Label htmlFor="current">Current password</Label>
                <Input id="current" type="password" />
              </div>
              <div>
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" />
              </div>
            </TabsContent>
            <TabsContent value="settings" className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="airplane-mode" />
                <Label htmlFor="airplane-mode">Airplane Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="wifi" />
                <Label htmlFor="wifi">Wi-Fi</Label>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="h-5 w-5 text-primary" />
            Table
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>John Doe</td>
                  <td>john@example.com</td>
                  <td>Admin</td>
                  <td><Badge className="bg-green-500">Active</Badge></td>
                  <td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Jane Smith</td>
                  <td>jane@example.com</td>
                  <td>User</td>
                  <td><Badge variant="secondary">Inactive</Badge></td>
                  <td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Bob Johnson</td>
                  <td>bob@example.com</td>
                  <td>Editor</td>
                  <td><Badge className="bg-green-500">Active</Badge></td>
                  <td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-8 border-t border-border">
        <p className="text-muted-foreground dark:text-slate-400">
          Dark mode styling demonstration - All components are fully responsive and accessible
        </p>
      </div>
    </div>
  )
} 