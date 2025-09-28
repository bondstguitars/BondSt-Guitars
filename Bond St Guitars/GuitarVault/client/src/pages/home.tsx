import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Guitar } from "@shared/schema";
import GuitarCard from "@/components/GuitarCard";
import FilterBar from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import AddGuitarModal from "@/components/AddGuitarModal";
import { Card, CardContent } from "@/components/ui/card";
import { Guitar as GuitarIcon, Plus } from "lucide-react";

interface FilterState {
  search: string;
  type: string;
  brand: string;
  status: string;
}

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "",
    brand: "",
    status: "",
  });

  const { data: guitars = [], isLoading, error } = useQuery<Guitar[]>({
    queryKey: ["/api/guitars", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/guitars?${params}`);
      if (!response.ok) throw new Error("Failed to fetch guitars");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-6 bg-muted rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <GuitarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Failed to load guitars</h2>
              <p className="text-muted-foreground mb-4">Please try refreshing the page</p>
              <Button onClick={() => window.location.reload()}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <GuitarIcon className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-serif font-bold text-foreground">GuitarCraft</h1>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#inventory" className="text-foreground hover:text-primary transition-colors font-medium">Inventory</a>
              <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">About</a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </nav>

            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-add-guitar"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Guitar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-accent">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')"
        }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/60"></div>

        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              Bond St Guitar Collection
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Discover exceptional instruments. From vintage classics to modern masterpieces.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-white text-primary px-8 py-3 hover:bg-white/90" size="lg">
                Browse Collection
              </Button>
              <Button variant="outline" className="border-2 border-white text-white px-8 py-3 hover:bg-white/10" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <FilterBar 
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8" id="inventory">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Guitar Inventory</h2>
            <p className="text-muted-foreground" data-testid="text-guitar-count">
              {guitars.length} guitars available
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Last updated: <span data-testid="text-last-updated">Just now</span>
          </div>
        </div>

        {guitars.length === 0 ? (
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center">
                <GuitarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No guitars found</h3>
                <p className="text-muted-foreground mb-4">
                  {Object.values(filters).some(v => v) 
                    ? "Try adjusting your search filters" 
                    : "Add your first guitar to get started"
                  }
                </p>
                <Button onClick={() => setIsAddModalOpen(true)} data-testid="button-add-first-guitar">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Guitar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {guitars.map((guitar) => (
              <GuitarCard 
                key={guitar.id} 
                guitar={guitar} 
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add Guitar Modal */}
      <AddGuitarModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <GuitarIcon className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-serif font-bold text-foreground">GuitarCraft</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Professional guitar inventory and marketplace for musicians and collectors.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Features</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Inventory Management</li>
                <li>Image Storage</li>
                <li>Location Tracking</li>
                <li>Price Management</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Contact Support</li>
                <li>Feature Requests</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
              <div className="space-y-2 text-muted-foreground">
                <div>Live@BondStGuitars.com</div>
                <div>(123) 123-MUSIC</div>
                <div>297 Bond St, Brooklyn NY</div>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Bond St Guitars. All rights reserved. Built for music lovers by music lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
