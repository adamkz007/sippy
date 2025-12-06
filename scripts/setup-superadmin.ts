/**
 * Script to set up superadmin access for adamkz.x@gmail.com
 * 
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/setup-superadmin.ts
 * Or add to package.json scripts and run: npm run setup-superadmin
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const SUPERADMIN_EMAIL = "adamkz.x@gmail.com"

async function main() {
  console.log("🔐 Setting up superadmin access...")
  
  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { email: SUPERADMIN_EMAIL },
  })

  if (user) {
    // Update existing user to SUPERADMIN
    user = await prisma.user.update({
      where: { email: SUPERADMIN_EMAIL },
      data: { role: "SUPERADMIN" },
    })
    console.log(`✅ Updated existing user ${SUPERADMIN_EMAIL} to SUPERADMIN role`)
  } else {
    // Create new user with SUPERADMIN role
    // Note: Password will need to be set separately or user can sign in via Google
    user = await prisma.user.create({
      data: {
        email: SUPERADMIN_EMAIL,
        name: "Adam KZ",
        role: "SUPERADMIN",
      },
    })
    console.log(`✅ Created new SUPERADMIN user: ${SUPERADMIN_EMAIL}`)
    console.log("   Note: Sign in with Google to complete account setup")
  }

  console.log("\n📋 User details:")
  console.log(`   ID: ${user.id}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Name: ${user.name}`)
  console.log(`   Role: ${user.role}`)
  
  console.log("\n🎉 Superadmin setup complete!")
  console.log("   Access the admin dashboard at: /admin")
}

main()
  .catch((e) => {
    console.error("❌ Error setting up superadmin:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

