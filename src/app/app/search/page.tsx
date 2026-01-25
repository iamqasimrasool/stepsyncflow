import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth";
import { isOrgWide } from "@/lib/rbac";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireSessionUser();
  const resolvedSearchParams = await searchParams;
  const query = (resolvedSearchParams.q ?? "").trim();
  const whereBase = isOrgWide(user.role)
    ? { orgId: user.orgId, isPublished: true }
    : {
        orgId: user.orgId,
        isPublished: true,
        departmentId: { in: user.departmentIds },
      };

  const sops = query
    ? await db.sOP.findMany({
        where: {
          ...whereBase,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { department: true },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Search SOPs</h2>
        <p className="text-sm text-muted-foreground">
          Search by title or summary.
        </p>
      </div>
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search SOPs..."
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
        <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          Search
        </button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {sops.map((sop) => (
          <Link key={sop.id} href={`/app/sop/${sop.id}`}>
            <Card className="transition hover:border-foreground/30">
              <CardContent className="space-y-1 p-4">
                <h3 className="font-semibold">{sop.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {sop.department.name}
                </p>
                {sop.summary && (
                  <p className="text-sm text-muted-foreground">
                    {sop.summary}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
        {query && !sops.length && (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              No results found for "{query}".
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
