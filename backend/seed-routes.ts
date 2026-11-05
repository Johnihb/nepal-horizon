import { prisma } from "./lib/prisma.ts";

const routes: Record<string, {
  center: [number, number];
  zoom: number;
  points: [number, number][];
  elevation: number[];
  stops: { name: string; lat: number; lng: number; type: string }[];
}> = {
  "Arnapurna treck": {
    center: [28.5, 84.0],
    zoom: 9,
    points: [[28.2096, 83.9856], [28.2333, 84.3833], [28.55, 84.2333], [28.6667, 84.0167], [28.7931, 83.9356], [28.8167, 83.8667], [28.7833, 83.7333], [28.5, 83.65]],
    elevation: [820, 1500, 2500, 3500, 5416, 3800, 2000, 1200],
    stops: [
      { name: "Pokhara", lat: 28.2096, lng: 83.9856, type: "start" },
      { name: "Manang", lat: 28.6667, lng: 84.0167, type: "village" },
      { name: "Thorong La", lat: 28.7931, lng: 83.9356, type: "pass" },
      { name: "Muktinath", lat: 28.8167, lng: 83.8667, type: "village" },
      { name: "Jomsom", lat: 28.7833, lng: 83.7333, type: "end" },
    ],
  },
  "Everest Base Camp Trek": {
    center: [27.85, 86.78],
    zoom: 10,
    points: [[27.6875, 86.7289], [27.8069, 86.71], [27.8364, 86.7644], [27.8936, 86.8314], [27.9494, 86.8067], [27.9653, 86.8269], [27.9881, 86.8586]],
    elevation: [2860, 3440, 3860, 4410, 4940, 5180, 5364],
    stops: [
      { name: "Lukla", lat: 27.6875, lng: 86.7289, type: "start" },
      { name: "Namche", lat: 27.8069, lng: 86.71, type: "village" },
      { name: "Tengboche", lat: 27.8364, lng: 86.7644, type: "village" },
      { name: "Dingboche", lat: 27.8936, lng: 86.8314, type: "village" },
      { name: "EBC", lat: 27.9881, lng: 86.8586, type: "end" },
    ],
  },
  "Ghorepani Poon Hill Trek": {
    center: [28.35, 83.73],
    zoom: 11,
    points: [[28.2917, 83.7667], [28.3167, 83.7333], [28.4, 83.7], [28.4006, 83.6867], [28.3833, 83.7667], [28.3667, 83.8]],
    elevation: [1000, 1500, 2000, 3210, 2600, 1940],
    stops: [
      { name: "Nayapul", lat: 28.2917, lng: 83.7667, type: "start" },
      { name: "Ghorepani", lat: 28.4, lng: 83.7, type: "village" },
      { name: "Poon Hill", lat: 28.4006, lng: 83.6867, type: "pass" },
      { name: "Ghandruk", lat: 28.3667, lng: 83.8, type: "end" },
    ],
  },
  "Pokhara Adventure Escape": {
    center: [28.21, 83.98],
    zoom: 12,
    points: [[28.2096, 83.9856], [28.24, 83.95], [28.19, 83.96], [28.2, 84.0]],
    elevation: [800, 1000, 900, 1100],
    stops: [
      { name: "Pokhara", lat: 28.2096, lng: 83.9856, type: "start" },
      { name: "Sarangkot", lat: 28.24, lng: 83.95, type: "pass" },
      { name: "Davis Falls", lat: 28.19, lng: 83.96, type: "village" },
    ],
  },
  "Lumbini Spiritual Journey": {
    center: [27.47, 83.276],
    zoom: 14,
    points: [[27.4833, 83.2764], [27.4694, 83.2756], [27.47, 83.276]],
    elevation: [150, 155, 160],
    stops: [
      { name: "Lumbini", lat: 27.4833, lng: 83.2764, type: "start" },
      { name: "Maya Devi", lat: 27.4694, lng: 83.2756, type: "end" },
    ],
  },
};

async function main() {
  for (const [name, route] of Object.entries(routes)) {
    const updated = await prisma.package.updateMany({
      where: { name },
      data: { route },
    });
    console.log(`${name}: ${updated.count} updated`);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});