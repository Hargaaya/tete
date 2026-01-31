import Screen from "./Screen";
import Button from "./Button";

type Props = {
  onReady: () => void;
  onCancel: () => void;
};

export default function ReadyScreen({ onReady, onCancel }: Props) {
  return (
    <Screen className="flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="text-8xl mb-6">📱</div>
        <h2 className="text-3xl font-bold mb-4">Get Ready!</h2>
        <p className="text-xl text-gray-500 mb-8">Place the screen so that it is facing your foes!</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={onReady}>Start!</Button>
          <Button variant="text" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Screen>
  );
}
