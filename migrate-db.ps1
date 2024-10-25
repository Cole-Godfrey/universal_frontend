# Create a new PowerShell script called migrate-db.ps1
$backupDir = ".\backup"

# Create backup directory if it doesn't exist
New-Item -ItemType Directory -Force -Path $backupDir

# Export local database
Write-Host "Exporting local database..."
mongodump --db plinko --out $backupDir

# Get Atlas connection string
Write-Host "Please enter your MongoDB Atlas connection string:"
$atlasUri = Read-Host

# Import to Atlas
Write-Host "Importing to Atlas..."
mongorestore --uri="$atlasUri" "$backupDir\plinko"

# Clean up
Write-Host "Cleaning up..."
Remove-Item -Recurse -Force $backupDir

Write-Host "Migration complete!"