import LineChart from "./line";
import PieChart from "./pie";
import Table from "./table";

export default async function DashboardPage() {

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      <div className="flex flex-col-reverse md:grid md:grid-cols-2 w-full gap-4">
        <div className="flex flex-col gap-8">
          <LineChart />
          <Table />
        </div>
        <div>
          <PieChart />
        </div>
      </div>
    </main>
  );
}
