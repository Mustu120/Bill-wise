import SignupForm from '../SignupForm';

export default function SignupFormExample() {
  return (
    <div className="max-w-md mx-auto p-8">
      <SignupForm
        onSubmit={(data) => {
          console.log('Signup submitted:', data);
          alert('Signup form submitted! Check console for data.');
        }}
      />
    </div>
  );
}
