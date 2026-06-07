from fastapi import APIRouter, UploadFile, File
from openai import OpenAI
import os
import tempfile

router = APIRouter()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...)
):

    try:

        if file.filename:
            suffix = file.filename.split('.')[-1]
        else:
            suffix = "webm"

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=f".{suffix}"
        ) as temp_audio:

            temp_audio.write(
                await file.read()
            )

            temp_audio_path = temp_audio.name

        with open(
            temp_audio_path,
            "rb"
        ) as audio_file:

            transcript = (
                client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )
            )

        return {
            "success": True,
            "text": transcript.text
        }

    except Exception as e:

        print(
            "Transcription error:",
            str(e)
        )

        return {
            "success": False,
            "error": str(e)
        }