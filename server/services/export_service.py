import io
import zipfile
import json
from models.schemas import CampaignState

def create_export_archive(state: CampaignState) -> io.BytesIO:
    """Creates an in-memory ZIP file holding the campaign assets."""
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        if state.drafts:
            # Add blog
            zip_file.writestr("blog.md", state.drafts.blog)
            
            # Add thread
            thread_content = "\n\n---\n\n".join(state.drafts.thread)
            zip_file.writestr("thread.txt", thread_content)
            
            # Add email
            zip_file.writestr("email.txt", state.drafts.email)
            
        if state.fact_sheet:
            json_dump = state.fact_sheet.model_dump_json(indent=2)
            zip_file.writestr("fact_sheet.json", json_dump)
            
        if state.raw_input:
            zip_file.writestr("source.txt", state.raw_input)
            
    return zip_buffer
