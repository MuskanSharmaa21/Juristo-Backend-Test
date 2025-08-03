export async function uploadFile(
  endpoint: string,
  file: File
): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`http://localhost:3000${endpoint}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('File upload error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}