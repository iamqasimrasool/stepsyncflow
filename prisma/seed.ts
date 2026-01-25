import bcrypt from "bcrypt";
import { PrismaClient, Role, VideoType } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const org = await db.organization.create({
    data: {
      name: "DemoCo",
      slug: "democo",
    },
  });

  const departments = await Promise.all(
    ["Operations", "Warehouse", "Customer Support", "Finance"].map((name) =>
      db.department.create({ data: { orgId: org.id, name } })
    )
  );

  const [operations, warehouse] = departments;

  const owner = await db.user.create({
    data: {
      orgId: org.id,
      name: "Owner User",
      email: "owner@democo.com",
      passwordHash,
      role: Role.OWNER,
    },
  });

  const admin = await db.user.create({
    data: {
      orgId: org.id,
      name: "Admin User",
      email: "admin@democo.com",
      passwordHash,
      role: Role.ORG_ADMIN,
    },
  });

  const editor = await db.user.create({
    data: {
      orgId: org.id,
      name: "Editor User",
      email: "editor@democo.com",
      passwordHash,
      role: Role.EDITOR,
    },
  });

  const viewer = await db.user.create({
    data: {
      orgId: org.id,
      name: "Viewer User",
      email: "viewer@democo.com",
      passwordHash,
      role: Role.VIEWER,
    },
  });

  await db.userDepartment.createMany({
    data: [
      { userId: owner.id, departmentId: operations.id },
      { userId: owner.id, departmentId: warehouse.id },
      { userId: admin.id, departmentId: operations.id },
      { userId: editor.id, departmentId: operations.id },
      { userId: viewer.id, departmentId: warehouse.id },
    ],
  });

  const sop = await db.sOP.create({
    data: {
      orgId: org.id,
      departmentId: operations.id,
      title: "Inbound Receiving Workflow",
      summary: "Standard operating procedure for receiving inbound inventory.",
      videoType: VideoType.YOUTUBE,
      videoUrl: "https://youtu.be/dQw4w9WgXcQ",
      isPublished: true,
    },
  });

  await db.sOPStep.createMany({
    data: [
      {
        sopId: sop.id,
        order: 1,
        heading: "Prep dock area",
        body: "Clear pallets and set staging lanes.",
        timestamp: 12,
      },
      {
        sopId: sop.id,
        order: 2,
        heading: "Verify shipment paperwork",
        body: "Match BOL with purchase order.",
        timestamp: 45,
      },
      {
        sopId: sop.id,
        order: 3,
        heading: "Unload and scan items",
        body: "Scan each pallet and confirm counts.",
        timestamp: 92,
      },
      {
        sopId: sop.id,
        order: 4,
        heading: "Quality check",
        body: "Inspect for damage and document exceptions.",
        timestamp: 135,
      },
      {
        sopId: sop.id,
        order: 5,
        heading: "Store inventory",
        body: "Move pallets to assigned locations.",
        timestamp: 190,
      },
    ],
  });
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
