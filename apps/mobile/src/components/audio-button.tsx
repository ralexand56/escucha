import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { ActionButton } from "@/components/action-button";

export function AudioButton({ uri, label = "Play audio" }: { uri: string; label?: string }) {
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);

  const toggle = () => {
    if (status.playing) player.pause();
    else {
      if (status.didJustFinish) player.seekTo(0);
      player.play();
    }
  };

  return <ActionButton label={status.playing ? "Pause" : label} onPress={toggle} />;
}
