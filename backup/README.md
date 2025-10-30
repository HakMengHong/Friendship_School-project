# 📦 Database Backups

This directory contains database backup files for the Friendship School project.

## 🔒 Important Notes

- Backup files (`.sql`) are **NOT tracked in Git** for security and size reasons
- Backups contain sensitive database information
- Files can be regenerated using the backup scripts

## 📋 How to Create a Backup

Run one of these commands to create a backup:

```bash
# Recommended: Prisma-based backup (works without pg_dump)
npm run db:backup
# or
node scripts/backup-database-prisma.js

# Alternative: Using pg_dump (requires PostgreSQL tools)
npm run db:backup:pg
# or
node scripts/backup-database.js
```

## 📊 How to Review Database

Check your database statistics:

```bash
npm run db:review
# or
node scripts/review-database.js
```

## ✅ How to Verify Backup

Verify that a backup file contains all your data:

```bash
node scripts/verify-backup.js
```

## 🔄 How to Restore from Backup

Restore your database from a backup file:

```bash
# Restore from latest backup
node scripts/restore-database.js

# Restore from specific backup file
node scripts/restore-database.js backup/friendship_school_backup_YYYYMMDD_HHMMSS.sql
```

## 📁 Backup Files

Backup files are named with the pattern:
```
friendship_school_backup_YYYYMMDD_HHMMSS.sql
```

Example: `friendship_school_backup_20251031_042600.sql`

## 💾 Current Backups

To see all available backups, list files in this directory:

```bash
# Windows PowerShell
Get-ChildItem backup\*.sql

# Linux/Mac
ls -lh backup/*.sql
```

## 🚨 Security Reminder

- Never commit backup files to version control
- Store backups in secure locations
- Keep backups encrypted if they contain sensitive data
- Regularly create and test backups

