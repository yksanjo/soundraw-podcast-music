// Platform-specific integration code for podcast music

export function getWebIntegrationCode(audioUrl: string, musicType: string): string {
  return `<!-- Web Player Integration -->
<audio id="podcast-music" loop>
  <source src="${audioUrl}" type="audio/mpeg">
</audio>

<script>
const music = document.getElementById('podcast-music');
music.volume = 0.3; // Background level

// Fade in
function fadeIn(duration = 2000) {
  music.volume = 0;
  music.play();
  const start = Date.now();
  const fade = () => {
    const elapsed = Date.now() - start;
    music.volume = Math.min(elapsed / duration, 0.3);
    if (elapsed < duration) requestAnimationFrame(fade);
  };
  fade();
}

// Fade out
function fadeOut(duration = 2000) {
  const start = music.volume;
  const startTime = Date.now();
  const fade = () => {
    const elapsed = Date.now() - startTime;
    music.volume = Math.max(start - (elapsed / duration) * start, 0);
    if (elapsed < duration) requestAnimationFrame(fade);
    else { music.pause(); music.volume = start; }
  };
  fade();
}

// Call fadeIn() when podcast starts, fadeOut() for breaks
</script>`;
}

export function getiOSIntegrationCode(audioUrl: string, musicType: string): string {
  return `// iOS - AVFoundation
import AVFoundation

class PodcastMusicManager {
    private var audioPlayer: AVAudioPlayer?
    
    func setupAudio() {
        guard let url = URL(string: "${audioUrl}") else { return }
        audioPlayer = try? AVAudioPlayer(contentsOf: url)
        audioPlayer?.numberOfLoops = -1 // Loop indefinitely
        audioPlayer?.volume = 0.3
    }
    
    func playWithFadeIn() {
        audioPlayer?.volume = 0
        audioPlayer?.play()
        // Implement fade with Timer
    }
    
    func fadeOutAndStop() {
        // Implement fade with Timer, then stop
    }
}`;
}

export function getAndroidIntegrationCode(audioUrl: string, musicType: string): string {
  return `// Android - MediaPlayer
import android.media.MediaPlayer;

public class PodcastMusicManager {
    private MediaPlayer mediaPlayer;
    
    public void setup(Context context) {
        mediaPlayer = MediaPlayer.create(context, R.raw.podcast_music);
        mediaPlayer.setLooping(true);
        mediaPlayer.setVolume(0.3f, 0.3f);
    }
    
    public void fadeIn() {
        mediaPlayer.setVolume(0f, 0f);
        mediaPlayer.start();
        // Implement fade with ValueAnimator
    }
    
    public void fadeOut() {
        // Implement fade with ValueAnimator, then pause
    }
}`;
}

export function getPodcastIntegrationCode(
  engine: 'web' | 'ios' | 'android' | undefined,
  audioUrl: string,
  musicType: string
): string | undefined {
  if (!engine) return undefined;
  switch (engine) {
    case 'web': return getWebIntegrationCode(audioUrl, musicType);
    case 'ios': return getiOSIntegrationCode(audioUrl, musicType);
    case 'android': return getAndroidIntegrationCode(audioUrl, musicType);
    default: return undefined;
  }
}
