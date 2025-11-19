// Audio management utility
class AudioManager {
  constructor() {
    this.gameAudio = null;
    this.victoryAudio = null;
    this.initAudio();
  }

  initAudio() {
    this.gameAudio = new Audio('/music/inGame.mp3');
    this.victoryAudio = new Audio('/music/gameEnd.mp3');

    // Set audio properties
    this.gameAudio.loop = true;
    this.gameAudio.volume = 0.3;
    
    this.victoryAudio.loop = false;
    this.victoryAudio.volume = 0.5;

    // Handle audio loading errors
    this.gameAudio.onerror = () => {
      console.warn('⚠️ Failed to load inGame.mp3. Make sure the file exists in /public/music/');
    };
    
    this.victoryAudio.onerror = () => {
      console.warn('⚠️ Failed to load gameEnd.mp3. Make sure the file exists in /public/music/');
    };
  }

  playGameMusic() {
    try {
      console.log('🎮 Attempting to play game music...');
      
      // Stop victory music if playing
      if (this.victoryAudio && !this.victoryAudio.paused) {
        this.victoryAudio.pause();
        this.victoryAudio.currentTime = 0;
      }
      
      // Don't restart if already playing
      if (this.gameAudio && !this.gameAudio.paused) {
        console.log('⏯️ Game music already playing, skipping...');
        return;
      }
      
      if (this.gameAudio) {
        this.gameAudio.currentTime = 0;
        const playPromise = this.gameAudio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('✅ Game music started successfully!');
            })
            .catch(err => {
              console.error('❌ Error playing game music:', err);
              console.log('💡 Try clicking on the page first (browser autoplay policy)');
            });
        }
      } else {
        console.error('❌ Game audio ref is null');
      }
    } catch (error) {
      console.error('❌ Error in playGameMusic:', error);
    }
  }

  playVictoryMusic() {
    try {
      console.log('🎉 Attempting to play victory music...');
      
      // Stop game music if playing
      if (this.gameAudio && !this.gameAudio.paused) {
        this.gameAudio.pause();
        this.gameAudio.currentTime = 0;
      }
      
      if (this.victoryAudio) {
        this.victoryAudio.currentTime = 0;
        const playPromise = this.victoryAudio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('✅ Victory music started successfully!');
            })
            .catch(err => {
              console.error('❌ Error playing victory music:', err);
              console.log('💡 Try clicking on the page first (browser autoplay policy)');
            });
        }
      } else {
        console.error('❌ Victory audio ref is null');
      }
    } catch (error) {
      console.error('❌ Error in playVictoryMusic:', error);
    }
  }

  stopAllMusic() {
    try {
      if (this.gameAudio) {
        this.gameAudio.pause();
        this.gameAudio.currentTime = 0;
      }
      if (this.victoryAudio) {
        this.victoryAudio.pause();
        this.victoryAudio.currentTime = 0;
      }
      console.log('🔇 All music stopped');
    } catch (error) {
      console.error('Error stopping music:', error);
    }
  }

  setGameVolume(volume) {
    if (this.gameAudio) {
      this.gameAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  setVictoryVolume(volume) {
    if (this.victoryAudio) {
      this.victoryAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  isGameMusicPlaying() {
    return this.gameAudio && !this.gameAudio.paused;
  }

  isVictoryMusicPlaying() {
    return this.victoryAudio && !this.victoryAudio.paused;
  }
}

// Singleton instance
const audioManager = new AudioManager();

export const playGameMusic = () => audioManager.playGameMusic();
export const playVictoryMusic = () => audioManager.playVictoryMusic();
export const stopAllMusic = () => audioManager.stopAllMusic();
export const setGameVolume = (volume) => audioManager.setGameVolume(volume);
export const setVictoryVolume = (volume) => audioManager.setVictoryVolume(volume);
export const isGameMusicPlaying = () => audioManager.isGameMusicPlaying();
export const isVictoryMusicPlaying = () => audioManager.isVictoryMusicPlaying();
