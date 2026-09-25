import { MessageCircle } from "lucide-react";

interface Props {
  phone: string;
  message: string;
}

export default function WhatsAppButton({ phone, message }: Props) {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      className="
flex
items-center
justify-center
gap-2
bg-green-600
hover:bg-green-700
text-white
px-6
py-3
rounded-full
font-semibold
transition
shadow-lg
"
    >
      <MessageCircle size={20} />
      Order on WhatsApp
    </a>
  );
}
