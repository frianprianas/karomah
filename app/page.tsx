import LoginForm from '@/components/LoginForm';
import BookFrame from '@/components/BookFrame';

export default function Home() {
  return (
    <BookFrame singlePage={true}>
      <div className="flex flex-col items-center justify-center w-full min-h-full py-2 md:py-10 px-2 md:px-0">
        <LoginForm />
      </div>
    </BookFrame>
  );
}
