import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Guitar = {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
};

export default function Home() {
  // Fetch guitars from backend
  const { data: guitars, isLoading } = useQuery<Guitar[]>({
    queryKey: ["guitars"],
    queryFn: async () => {
      const res = await fetch("/api/guitars");
      if (!res.ok) throw new Error("Failed to fetch guitars");
      return res.json();
    },
  });

  if (isLoading) {
    return <p className="text-center mt-10">Loading guitars...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Browse Our Collection</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {guitars?.map((guitar) => (
          <Card key={guitar.id} className="guitar-card fade-in">
            <img
              src={guitar.imageUrl}
              alt={guitar.name}
              className="w-full h-56 object-cover rounded-t-lg"
            />
            <CardHeader>
              <CardTitle>{guitar.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{guitar.brand}</p>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                ${Number(guitar.price).toFixed(2)}
              </p>

              <Button
                className="mt-3 w-full"
                variant="default"
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
