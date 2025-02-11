const { data: hotel, isLoading, error } = useQuery(['hotel', id], () =>
    getHotel(id as string),
    {
      retry: 2,
      onError: (err) => {
        toast({
          title: "Error loading hotel",
          description: err instanceof Error ? err.message : "Failed to load hotel details",
          variant: "destructive",
        });
      }
    }
  );

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load hotel details</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center p-8"><Spinner /></div>;
  }