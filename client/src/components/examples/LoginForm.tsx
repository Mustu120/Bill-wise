import LoginForm from '../LoginForm';

export default function LoginFormExample() {
  return (
    <div className="max-w-md mx-auto p-8">
      <LoginForm
        onSubmit={(data) => {
          console.log('Login submitted:', data);
          alert('Login form submitted! Check console for data.');
        }}
      />
    </div>
  );
}
