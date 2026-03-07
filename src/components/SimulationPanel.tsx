import { useEffect, useState } from "react";
import RoutingGraph from "./simulations/RoutingGraph";
import PacketTimeline from "./simulations/PacketTimeline";
import LeakyBucket from "./simulations/LeakyBucket";
import { Loader2 } from "lucide-react";

export default function SimulationPanel({ experimentId, type }: { experimentId: number, type: string }) {
  const [simulationData, setSimulationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/simulate/${experimentId}`)
      .then(res => {
        if (!res.ok) throw new Error("Simulation data not found");
        return res.json();
      })
      .then(data => {
        setSimulationData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [experimentId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        <p>Loading simulation...</p>
      </div>
    );
  }

  if (error || !simulationData) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-red-400">
        <p>Simulation not available for this experiment yet.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {type === "routing_graph" && <RoutingGraph data={simulationData} />}
      {type === "packet_timeline" && <PacketTimeline data={simulationData} />}
      {type === "leaky_bucket" && <LeakyBucket data={simulationData} />}
    </div>
  );
}
