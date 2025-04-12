import os
import logging
import speech_recognition as sr
import subprocess
import time

logger = logging.getLogger(__name__)

def transcribe_audio(audio_path):
    """
    Transcribe audio file using Google's free Speech Recognition API.
    For longer files, only transcribe the first minute to avoid timeout.
    
    Args:
        audio_path (str): Path to the audio file
        
    Returns:
        str: Transcribed text with note if truncated
    """
    try:
        logger.debug(f"Transcribing audio file: {audio_path}")
        
        # Initialize recognizer
        recognizer = sr.Recognizer()
        
        # Convert to proper WAV format (16kHz, 16-bit, mono)
        # And trim to 60 seconds to avoid timeout
        converted_audio_path = audio_path.replace('.wav', '_converted.wav')
        short_audio_path = audio_path.replace('.wav', '_short.wav')
        
        try:
            # First convert to proper format
            cmd = [
                'ffmpeg', '-y', '-i', audio_path, 
                '-acodec', 'pcm_s16le', '-ac', '1', '-ar', '16000',
                converted_audio_path
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            logger.debug(f"Converted audio to proper format: {converted_audio_path}")
            
            # Then create a 60-second version (or full length if shorter)
            cmd = [
                'ffmpeg', '-y', '-i', converted_audio_path,
                '-t', '60', '-c', 'copy', short_audio_path
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            logger.debug(f"Created shortened version for transcription: {short_audio_path}")
            
            # Use the shortened file
            transcribe_path = short_audio_path
        except Exception as e:
            logger.warning(f"Could not convert/trim audio format: {e}")
            # Continue with original file if conversion fails
            transcribe_path = audio_path
        
        # Simple transcription of the short audio
        transcript = ""
        is_truncated = False
        
        try:
            with sr.AudioFile(transcribe_path) as source:
                # Get audio info
                try:
                    audio_info = source
                    logger.debug(f"Audio information: Sample width={audio_info.SAMPLE_WIDTH}, " 
                                 f"Sample rate={audio_info.SAMPLE_RATE}, Channels={audio_info.CHANNELS}")
                except Exception as e:
                    logger.debug(f"Could not get audio info: {e}")
                
                # Adjust for ambient noise
                recognizer.adjust_for_ambient_noise(source)
                
                # Record the audio data
                audio_data = recognizer.record(source)
                
                # Recognize speech using Google's Speech Recognition
                transcript = recognizer.recognize_google(audio_data)
                logger.debug("Successfully transcribed audio")
                
                # Check if we used the shortened version
                if transcribe_path == short_audio_path:
                    original_duration = get_audio_duration(converted_audio_path)
                    if original_duration > 60:
                        is_truncated = True
                        logger.debug(f"Original audio duration was {original_duration} seconds, transcription was truncated")
        
        except sr.UnknownValueError:
            logger.warning("Google Speech Recognition could not understand the audio")
            transcript = "Speech Recognition could not understand the audio."
        
        except sr.RequestError as e:
            logger.warning(f"Could not request results from Google Speech Recognition service: {e}")
            transcript = f"Could not connect to Speech Recognition service. Error: {e}"
        
        except Exception as e:
            logger.warning(f"General error in transcription: {e}")
            transcript = f"There was an error transcribing this audio. Please try again with a clearer recording."
        
        # Clean up temporary files
        try:
            for temp_file in [converted_audio_path, short_audio_path]:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
        except Exception as cleanup_error:
            logger.warning(f"Could not clean up temporary files: {cleanup_error}")
        
        # Add note if truncated
        if is_truncated:
            transcript += "\n\n[Note: This is a partial transcription of the first 60 seconds. The full audio was longer.]"
            
        if not transcript:
            transcript = "No transcription was generated. The audio might be silent or unclear."
            
        logger.debug(f"Transcription completed: {len(transcript)} characters")
        return transcript
    
    except Exception as e:
        logger.error(f"Critical error in transcription function: {e}")
        return f"Error transcribing audio: {str(e)}"

def get_audio_duration(audio_path):
    """Get duration of audio file in seconds using ffmpeg"""
    try:
        cmd = [
            'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1', audio_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        duration = float(result.stdout.strip())
        return duration
    except Exception as e:
        logger.warning(f"Could not determine audio duration: {e}")
        return 0
