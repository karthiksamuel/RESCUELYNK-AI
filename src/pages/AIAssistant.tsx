import { AstraChatbot } from "@/components/astra-chatbot";

const AIAssistant = () => {
  return (
    <div className="flex flex-col min-h-screen w-full pb-10">
      <div className="max-w-6xl mx-auto w-full gap-6">
        <AstraChatbot />
      </div>
    </div>
  );
};

export default AIAssistant;
