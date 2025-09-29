import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Guitar } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Palette, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GuitarCardProps {
  guitar: Guitar;
  viewMode: "grid" | "list";
}

export default function GuitarCard({ guitar, viewMode }: GuitarCardProps) {
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/guitars/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guitars"] });
      toast({
        title: "Guitar deleted",
        description: "The guitar has been removed from your inventory.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the guitar. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this guitar?")) {
      deleteMutation.mutate(guitar.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement edit functionality
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-accent/10 text-accent";
      case "reserved":
        return "bg-secondary/50 text-secondary-foreground";
      case "sold":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const imageUrl = guitar.imageUrl?.startsWith("/objects/") 
    ? guitar.imageUrl 
    : "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400";

  if (viewMode === "list") {
    return (
      <Card className="guitar-card hover:shadow-lg transition-all duration-300 relative group" data-testid={`card-guitar-${guitar.id}`}>
        <Link href={`/guitar/${guitar.id}`} className="block" data-testid={`link-guitar-${guitar.id}`}>
          <CardContent className="p-6">
            <div className="flex gap-6">
              <img
                src={imageError ? "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150" : imageUrl}
                alt={`${guitar.brand} ${guitar.model}`}
                className="w-48 h-32 object-cover rounded-md"
                onError={() => setImageError(true)}
                data-testid={`img-guitar-${guitar.id}`}
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground text-xl group-hover:text-primary transition-colors" data-testid={`text-brand-${guitar.id}`}>
                      {guitar.brand}
                    </h3>
                    <p className="text-muted-foreground text-lg" data-testid={`text-model-${guitar.id}`}>
                      {guitar.model}
                    </p>
                  </div>
                  <Badge className={getStatusColor(guitar.status)} data-testid={`badge-status-${guitar.id}`}>
                    {guitar.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span data-testid={`text-year-${guitar.id}`}>{guitar.year}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span data-testid={`text-location-${guitar.id}`}>{guitar.pickupLocation}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Palette className="h-4 w-4 mr-2" />
                    <span data-testid={`text-color-${guitar.id}`}>{guitar.color}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Type: <span data-testid={`text-type-${guitar.id}`}>{guitar.type}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-primary" data-testid={`text-price-${guitar.id}`}>
                    ${parseFloat(guitar.price).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Link>
        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-black rounded-md p-1 shadow-lg">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-primary"
            onClick={handleEdit}
            data-testid={`button-edit-${guitar.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            data-testid={`button-delete-${guitar.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="guitar-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group" data-testid={`card-guitar-${guitar.id}`}>
      <Link href={`/guitar/${guitar.id}`} className="block" data-testid={`link-guitar-${guitar.id}`}>
        <img
          src={imageError ? "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" : imageUrl}
          alt={`${guitar.brand} ${guitar.model}`}
          className="w-full h-48 object-cover"
          onError={() => setImageError(true)}
          data-testid={`img-guitar-${guitar.id}`}
        />
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors" data-testid={`text-brand-${guitar.id}`}>
                {guitar.brand}
              </h3>
              <p className="text-muted-foreground" data-testid={`text-model-${guitar.id}`}>
                {guitar.model}
              </p>
            </div>
            <Badge className={getStatusColor(guitar.status)} data-testid={`badge-status-${guitar.id}`}>
              {guitar.status}
            </Badge>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span data-testid={`text-year-${guitar.id}`}>{guitar.year}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span data-testid={`text-location-${guitar.id}`}>{guitar.pickupLocation}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Palette className="h-4 w-4 mr-2" />
              <span data-testid={`text-color-${guitar.id}`}>{guitar.color}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary" data-testid={`text-price-${guitar.id}`}>
              ${parseFloat(guitar.price).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Link>
      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-black rounded-md p-1 shadow-lg">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-primary"
          onClick={handleEdit}
          data-testid={`button-edit-${guitar.id}`}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          data-testid={`button-delete-${guitar.id}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
