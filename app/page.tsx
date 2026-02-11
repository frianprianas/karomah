import LoginForm from '@/components/LoginForm';
import BookFrame from '@/components/BookFrame';

export default function Home() {
  return (
    <BookFrame singlePage={true}>
      <div className="w-full h-full flex items-center justify-center p-0 md:p-4 overflow-hidden">
        <LoginForm />
      </div>
    </BookFrame>
  );
}
