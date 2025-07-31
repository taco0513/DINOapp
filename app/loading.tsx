export default function Loading() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='text-center p-5'>
        <div className='w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin mx-auto mb-4' />
        <p className='text-sm text-muted-foreground'>Loading...</p>
      </div>
    </div>
  );
}
