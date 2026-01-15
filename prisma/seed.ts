import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🧹 Cleaning existing data...")
  await prisma.outreachHistory.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.task.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.deal.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.user.deleteMany()

  // Create demo users
  console.log("👥 Creating demo users...")
  const user1 = await prisma.user.create({
    data: {
      email: "john.doe@xerocrm.com",
      name: "John Doe",
      role: "admin",
      avatar: null,
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: "jane.smith@xerocrm.com",
      name: "Jane Smith",
      role: "user",
      avatar: null,
    },
  })

  const user3 = await prisma.user.create({
    data: {
      email: "mike.johnson@xerocrm.com",
      name: "Mike Johnson",
      role: "user",
      avatar: null,
    },
  })

  // Create demo leads
  console.log("📋 Creating demo leads...")
  const leads = [
    {
      company: "TechCorp Solutions",
      contactName: "Sarah Williams",
      contactEmail: "sarah.williams@techcorp.com",
      contactPhone: "+1-555-0101",
      temperature: "hot",
      dealValue: 125000,
      rating: 5,
      status: "hot",
      source: "Referral",
      industry: "Technology",
      conversionProbability: 75,
      notes: "Very interested in our enterprise package. Follow up next week.",
      assignedToId: user1.id,
    },
    {
      company: "Global Industries Ltd",
      contactName: "Robert Chen",
      contactEmail: "r.chen@globalind.com",
      contactPhone: "+1-555-0102",
      temperature: "warm",
      dealValue: 85000,
      rating: 4,
      status: "warm",
      source: "Website",
      industry: "Manufacturing",
      conversionProbability: 50,
      notes: "Requested a demo. Scheduled for next month.",
      assignedToId: user2.id,
    },
    {
      company: "StartupHub Inc",
      contactName: "Emily Davis",
      contactEmail: "emily@startuphub.io",
      contactPhone: "+1-555-0103",
      temperature: "hot",
      dealValue: 45000,
      rating: 5,
      status: "hot",
      source: "Referral",
      industry: "Technology",
      conversionProbability: 75,
      notes: "Fast-growing startup. Needs quick implementation.",
      assignedToId: user1.id,
    },
    {
      company: "MegaCorp Enterprises",
      contactName: "David Brown",
      contactEmail: "d.brown@megacorp.com",
      contactPhone: "+1-555-0104",
      temperature: "cold",
      dealValue: 200000,
      rating: 3,
      status: "cold",
      source: "Cold Call",
      industry: "Enterprise",
      conversionProbability: 25,
      notes: "Large enterprise. Long sales cycle expected.",
      assignedToId: user3.id,
    },
    {
      company: "InnovateTech Systems",
      contactName: "Lisa Anderson",
      contactEmail: "lisa@innovatetech.com",
      contactPhone: "+1-555-0105",
      temperature: "warm",
      dealValue: 65000,
      rating: 4,
      status: "warm",
      source: "Website",
      industry: "Manufacturing",
      conversionProbability: 50,
      notes: "Interested in our premium features.",
      assignedToId: user2.id,
    },
    {
      company: "CloudFirst Solutions",
      contactName: "Michael Taylor",
      contactEmail: "m.taylor@cloudfirst.com",
      contactPhone: "+1-555-0106",
      temperature: "hot",
      dealValue: 95000,
      rating: 5,
      status: "hot",
      source: "Referral",
      industry: "Technology",
      conversionProbability: 75,
      notes: "Ready to move forward. Needs pricing details.",
      assignedToId: user1.id,
    },
    {
      company: "DataDrive Analytics",
      contactName: "Jennifer Martinez",
      contactEmail: "j.martinez@datadrive.com",
      contactPhone: "+1-555-0107",
      temperature: "warm",
      dealValue: 55000,
      rating: 4,
      status: "cold",
      source: "Cold Call",
      industry: "Enterprise",
      conversionProbability: 25,
      notes: "Initial contact made. Waiting for response.",
      assignedToId: user3.id,
    },
    {
      company: "NextGen Software",
      contactName: "Christopher Lee",
      contactEmail: "chris@nextgen.io",
      contactPhone: "+1-555-0108",
      temperature: "cold",
      dealValue: 35000,
      rating: 2,
      status: "cold",
      source: "Cold Call",
      industry: "Enterprise",
      conversionProbability: 25,
      notes: "Early stage company. Budget constraints.",
      assignedToId: user2.id,
    },
  ]

  const createdLeads = await Promise.all(
    leads.map((lead) => prisma.lead.create({ data: lead }))
  )

  // Create contacts for leads
  console.log("👤 Creating contacts for leads...")
  const contacts = [
    // TechCorp Solutions - Multiple contacts
    {
      leadId: createdLeads[0].id,
      name: "Sarah Williams",
      designation: "CEO",
      email: "sarah.williams@techcorp.com",
      phone: "+1-555-0101",
      isPrimary: true,
    },
    {
      leadId: createdLeads[0].id,
      name: "Mark Thompson",
      designation: "CTO",
      email: "mark.thompson@techcorp.com",
      phone: "+1-555-0109",
      isPrimary: false,
    },
    {
      leadId: createdLeads[0].id,
      name: "Jessica Park",
      designation: "VP of Sales",
      email: "jessica.park@techcorp.com",
      phone: "+1-555-0110",
      isPrimary: false,
    },
    // Global Industries - Multiple contacts
    {
      leadId: createdLeads[1].id,
      name: "Robert Chen",
      designation: "Director of Operations",
      email: "r.chen@globalind.com",
      phone: "+1-555-0102",
      isPrimary: true,
    },
    {
      leadId: createdLeads[1].id,
      name: "Amanda Liu",
      designation: "Procurement Manager",
      email: "amanda.liu@globalind.com",
      phone: "+1-555-0111",
      isPrimary: false,
    },
    // StartupHub Inc - Multiple contacts
    {
      leadId: createdLeads[2].id,
      name: "Emily Davis",
      designation: "Founder & CEO",
      email: "emily@startuphub.io",
      phone: "+1-555-0103",
      isPrimary: true,
    },
    {
      leadId: createdLeads[2].id,
      name: "Ryan Mitchell",
      designation: "Co-Founder",
      email: "ryan@startuphub.io",
      phone: "+1-555-0112",
      isPrimary: false,
    },
    // MegaCorp Enterprises
    {
      leadId: createdLeads[3].id,
      name: "David Brown",
      designation: "VP of Technology",
      email: "d.brown@megacorp.com",
      phone: "+1-555-0104",
      isPrimary: true,
    },
    {
      leadId: createdLeads[3].id,
      name: "Patricia White",
      designation: "IT Director",
      email: "patricia.white@megacorp.com",
      phone: "+1-555-0113",
      isPrimary: false,
    },
    // InnovateTech Systems - Multiple contacts
    {
      leadId: createdLeads[4].id,
      name: "Lisa Anderson",
      designation: "Head of Product",
      email: "lisa@innovatetech.com",
      phone: "+1-555-0105",
      isPrimary: true,
    },
    {
      leadId: createdLeads[4].id,
      name: "Kevin Johnson",
      designation: "Engineering Lead",
      email: "kevin@innovatetech.com",
      phone: "+1-555-0114",
      isPrimary: false,
    },
    // CloudFirst Solutions - Multiple contacts
    {
      leadId: createdLeads[5].id,
      name: "Michael Taylor",
      designation: "Sales Director",
      email: "m.taylor@cloudfirst.com",
      phone: "+1-555-0106",
      isPrimary: true,
    },
    {
      leadId: createdLeads[5].id,
      name: "Sophie Martinez",
      designation: "Marketing Manager",
      email: "sophie@cloudfirst.com",
      phone: "+1-555-0115",
      isPrimary: false,
    },
    // DataDrive Analytics
    {
      leadId: createdLeads[6].id,
      name: "Jennifer Martinez",
      designation: "Data Science Lead",
      email: "j.martinez@datadrive.com",
      phone: "+1-555-0107",
      isPrimary: true,
    },
    // NextGen Software
    {
      leadId: createdLeads[7].id,
      name: "Christopher Lee",
      designation: "Founder",
      email: "chris@nextgen.io",
      phone: "+1-555-0108",
      isPrimary: true,
    },
  ]

  const createdContacts = await Promise.all(
    contacts.map((contact) => prisma.contact.create({ data: contact }))
  )

  // Create outreach history
  console.log("📞 Creating outreach history...")
  const outreachHistory = [
    {
      leadId: createdLeads[0].id,
      contactId: createdContacts[0].id, // Sarah Williams
      userId: user1.id,
      type: "call",
      outcome: "positive",
      notes: "Initial discovery call. Very interested in enterprise package. Discussed pricing and timeline.",
      contactDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      leadId: createdLeads[0].id,
      contactId: createdContacts[1].id, // Mark Thompson
      userId: user1.id,
      type: "email",
      outcome: "followup",
      notes: "Sent technical documentation and integration guide. Waiting for technical team review.",
      contactDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      leadId: createdLeads[0].id,
      contactId: createdContacts[0].id, // Sarah Williams
      userId: user1.id,
      type: "call",
      outcome: "positive",
      notes: "Follow-up call. Discussed contract terms. Very positive response. Ready to move forward.",
      contactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      leadId: createdLeads[1].id,
      contactId: createdContacts[3].id, // Robert Chen
      userId: user2.id,
      type: "email",
      outcome: "neutral",
      notes: "Sent initial introduction email with company overview and product information.",
      contactDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    {
      leadId: createdLeads[1].id,
      contactId: createdContacts[3].id, // Robert Chen
      userId: user2.id,
      type: "call",
      outcome: "followup",
      notes: "Scheduled demo for next month. Client requested more information about pricing.",
      contactDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    },
    {
      leadId: createdLeads[2].id,
      contactId: createdContacts[5].id, // Emily Davis
      userId: user1.id,
      type: "call",
      outcome: "positive",
      notes: "Initial call with founder. Fast-growing startup needs quick implementation. Very interested.",
      contactDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    },
    {
      leadId: createdLeads[2].id,
      contactId: createdContacts[6].id, // Ryan Mitchell
      userId: user1.id,
      type: "meeting",
      outcome: "positive",
      notes: "Product demo meeting. Co-founder attended. Both very impressed with features. Ready for proposal.",
      contactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      leadId: createdLeads[3].id,
      contactId: createdContacts[7].id, // David Brown
      userId: user3.id,
      type: "email",
      outcome: "negative",
      notes: "Initial outreach. No response yet. Large enterprise with long sales cycle expected.",
      contactDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
    {
      leadId: createdLeads[4].id,
      contactId: createdContacts[9].id, // Lisa Anderson
      userId: user2.id,
      type: "call",
      outcome: "positive",
      notes: "Discussed premium features. Client is interested in advanced analytics capabilities.",
      contactDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    },
    {
      leadId: createdLeads[5].id,
      contactId: createdContacts[11].id, // Michael Taylor
      userId: user1.id,
      type: "email",
      outcome: "followup",
      notes: "Sent pricing details. Client requested additional information about integration.",
      contactDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    },
    {
      leadId: createdLeads[5].id,
      contactId: createdContacts[11].id, // Michael Taylor
      userId: user1.id,
      type: "call",
      outcome: "positive",
      notes: "Follow-up call. Ready to move forward. Needs technical evaluation.",
      contactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      leadId: createdLeads[6].id,
      contactId: createdContacts[13].id, // Jennifer Martinez
      userId: user3.id,
      type: "call",
      outcome: "neutral",
      notes: "Initial contact call. Discussed basic requirements. Waiting for response.",
      contactDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      leadId: createdLeads[7].id,
      contactId: createdContacts[14].id, // Christopher Lee
      userId: user2.id,
      type: "email",
      outcome: "negative",
      notes: "Initial outreach. Early stage company with budget constraints. Needs nurturing.",
      contactDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    },
  ]

  await Promise.all(
    outreachHistory.map((outreach) => prisma.outreachHistory.create({ data: outreach }))
  )

  // Create demo deals
  console.log("💼 Creating demo deals...")
  const deals = [
    {
      company: "TechCorp Solutions",
      value: 125000,
      stage: "negotiation",
      probability: 75,
      ownerId: user1.id,
      leadId: createdLeads[0].id,
      expectedClose: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: "Finalizing contract terms. Very close to closing.",
    },
    {
      company: "StartupHub Inc",
      value: 45000,
      stage: "proposal",
      probability: 60,
      ownerId: user1.id,
      leadId: createdLeads[2].id,
      expectedClose: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      notes: "Proposal sent. Waiting for approval.",
    },
    {
      company: "CloudFirst Solutions",
      value: 95000,
      stage: "qualified",
      probability: 50,
      ownerId: user1.id,
      leadId: createdLeads[5].id,
      expectedClose: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      notes: "Qualified lead. Needs technical evaluation.",
    },
    {
      company: "Global Industries Ltd",
      value: 85000,
      stage: "prospecting",
      probability: 30,
      ownerId: user2.id,
      leadId: createdLeads[1].id,
      expectedClose: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      notes: "Initial discussions. Building relationship.",
    },
    {
      company: "InnovateTech Systems",
      value: 65000,
      stage: "closed-won",
      probability: 100,
      ownerId: user2.id,
      leadId: createdLeads[4].id,
      expectedClose: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      notes: "Deal closed successfully! Great customer.",
    },
    {
      company: "DataDrive Analytics",
      value: 55000,
      stage: "prospecting",
      probability: 25,
      ownerId: user3.id,
      leadId: createdLeads[6].id,
      expectedClose: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      notes: "Early stage. Needs nurturing.",
    },
  ]

  const createdDeals = await Promise.all(
    deals.map((deal) => prisma.deal.create({ data: deal }))
  )

  // Create demo campaigns
  console.log("📢 Creating demo campaigns...")
  const campaigns = [
    {
      name: "Q1 Product Launch",
      description: "Launch campaign for new product features",
      type: "email",
      status: "active",
      createdById: user1.id,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      sent: 5000,
      opened: 3400,
      clicked: 850,
      converted: 120,
    },
    {
      name: "Summer Promotion",
      description: "Summer discount campaign",
      type: "social",
      status: "active",
      createdById: user2.id,
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      sent: 8000,
      opened: 5200,
      clicked: 1200,
      converted: 180,
    },
    {
      name: "Webinar Series",
      description: "Educational webinar campaign",
      type: "email",
      status: "completed",
      createdById: user1.id,
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      sent: 3000,
      opened: 2100,
      clicked: 600,
      converted: 90,
    },
    {
      name: "Holiday Special",
      description: "Year-end holiday promotion",
      type: "email",
      status: "draft",
      createdById: user3.id,
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      sent: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
    },
  ]

  await Promise.all(
    campaigns.map((campaign) => prisma.campaign.create({ data: campaign }))
  )

  // Create demo tasks
  console.log("✅ Creating demo tasks...")
  const tasks = [
    {
      title: "Follow up with TechCorp Solutions",
      description: "Call Sarah to discuss contract terms",
      status: "in-progress",
      priority: "high",
      category: "Sales",
      assignedToId: user1.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
    {
      title: "Prepare proposal for StartupHub",
      description: "Create detailed proposal document",
      status: "todo",
      priority: "high",
      category: "Sales",
      assignedToId: user1.id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    },
    {
      title: "Schedule demo with Global Industries",
      description: "Set up product demonstration",
      status: "todo",
      priority: "medium",
      category: "Sales",
      assignedToId: user2.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    {
      title: "Review Q1 campaign performance",
      description: "Analyze campaign metrics and ROI",
      status: "completed",
      priority: "medium",
      category: "Marketing",
      assignedToId: user2.id,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      title: "Update website content",
      description: "Refresh homepage with new features",
      status: "in-progress",
      priority: "low",
      category: "Marketing",
      assignedToId: user3.id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    },
    {
      title: "Client onboarding - InnovateTech",
      description: "Onboard new client and set up account",
      status: "completed",
      priority: "high",
      category: "Operations",
      assignedToId: user2.id,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  ]

  await Promise.all(
    tasks.map((task) => prisma.task.create({ data: task }))
  )

  // Create demo activities
  console.log("📝 Creating demo activities...")
  const activities = [
    {
      type: "call",
      title: "Called Sarah Williams - TechCorp",
      description: "Discussed contract terms and pricing. Very positive response.",
      userId: user1.id,
      leadId: createdLeads[0].id,
      dealId: createdDeals[0].id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      type: "email",
      title: "Sent proposal to StartupHub",
      description: "Proposal document sent via email. Waiting for feedback.",
      userId: user1.id,
      leadId: createdLeads[2].id,
      dealId: createdDeals[1].id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      type: "meeting",
      title: "Demo scheduled with Global Industries",
      description: "Product demonstration scheduled for next week.",
      userId: user2.id,
      leadId: createdLeads[1].id,
      dealId: createdDeals[3].id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      type: "note",
      title: "Follow up note - CloudFirst",
      description: "Client requested additional information about integration.",
      userId: user1.id,
      leadId: createdLeads[5].id,
      dealId: createdDeals[2].id,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    },
    {
      type: "call",
      title: "Initial call with DataDrive",
      description: "First contact call. Discussed basic requirements.",
      userId: user3.id,
      leadId: createdLeads[6].id,
      dealId: createdDeals[5].id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      type: "email",
      title: "Welcome email - InnovateTech",
      description: "Sent welcome email to new client.",
      userId: user2.id,
      leadId: createdLeads[4].id,
      dealId: createdDeals[4].id,
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    },
    {
      type: "meeting",
      title: "Quarterly review meeting",
      description: "Reviewed Q1 performance and discussed Q2 goals.",
      userId: user1.id,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    {
      type: "note",
      title: "Research note - NextGen Software",
      description: "Researched company background and potential fit.",
      userId: user2.id,
      leadId: createdLeads[7].id,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    },
  ]

  await Promise.all(
    activities.map((activity) => prisma.activity.create({ data: activity }))
  )

  console.log("✅ Database seeded successfully!")
  console.log(`   - ${await prisma.user.count()} users`)
  console.log(`   - ${await prisma.lead.count()} leads`)
  console.log(`   - ${await prisma.contact.count()} contacts`)
  console.log(`   - ${await prisma.outreachHistory.count()} outreach history entries`)
  console.log(`   - ${await prisma.deal.count()} deals`)
  console.log(`   - ${await prisma.campaign.count()} campaigns`)
  console.log(`   - ${await prisma.task.count()} tasks`)
  console.log(`   - ${await prisma.activity.count()} activities`)
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

