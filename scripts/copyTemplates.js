const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const copyFile = promisify(fs.copyFile)
const mkdir = promisify(fs.mkdir)

const srcDir = 'src/templates'
const distDir = 'dist/templates'

async function copyTemplates() {
  try {
    // Ensure the dist/templates directory exists
    await mkdir(distDir, { recursive: true })

    // Get a list of files in src/templates
    const files = fs.readdirSync(srcDir)

    // Copy each file from src/templates to dist/templates
    for (const file of files) {
      const srcPath = path.join(srcDir, file)
      const distPath = path.join(distDir, file)
      await copyFile(srcPath, distPath)
      console.log(`Copied: ${file}`)
    }

    console.log('Templates copied successfully!')
  } catch (err) {
    console.error('Error copying templates:', err)
  }
}

copyTemplates()
