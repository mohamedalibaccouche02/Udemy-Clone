import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAdminAnalytics } from "actions/get-admin-analytics";
import { DataCard } from "../../teacher/analytics/_components/data-card";
import { Chart } from "../../teacher/analytics/_components/chart";

const AdminAnalyticsPage = async () => {
  const { userId } = await auth();

  if (!userId) return redirect("/");

  const { data, totalRevenue, totalSales } = await getAdminAnalytics();

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <DataCard label="Total Revenue" value={totalRevenue} shouldFormat />
        <DataCard label="Total Sales" value={totalSales} />
      </div>
      <Chart data={data} />
    </div>
  );
};

export default AdminAnalyticsPage;
