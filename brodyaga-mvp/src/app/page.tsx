import dynamic from "next/dynamic";

const MapScreen = dynamic(() => import("@/components/MapScreen"), {
  ssr: false
});

export default function Home() {
  return <MapScreen />;
}
