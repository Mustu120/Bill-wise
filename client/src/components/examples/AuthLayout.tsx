import AuthLayout from '../AuthLayout';

export default function AuthLayoutExample() {
  return (
    <AuthLayout title="Welcome" subtitle="This is an example layout">
      <div className="text-center text-muted-foreground">
        Content goes here
      </div>
    </AuthLayout>
  );
}
