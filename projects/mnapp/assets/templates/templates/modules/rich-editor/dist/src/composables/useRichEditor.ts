import { ref } from 'vue';

import type { QEditor } from 'quasar';
import { uid } from 'quasar';

import { getDownloadURL, ref as storageRef, uploadString } from 'firebase/storage';

import imageFileToBase64 from 'utils/imageFileToBase64.js';

import { getStorage } from 'services/firebase.js';

export default function useRichEditor() {
  // Private

  const imageQueue: {
    fileName: string;
    data: string;
  }[] = [];

  // Composables

  const storage = getStorage();

  // Data

  const editortRef = ref<QEditor | null>(null);

  // Methods

  async function onEditorPaste(evt: ClipboardEvent) {
    if (editortRef.value === null) {
      return;
    }

    // Let inputs do their thing, so we don't break pasting of links.
    if ((evt.target as Element).nodeName === 'INPUT') return;

    evt.preventDefault();
    evt.stopPropagation();

    if (evt.clipboardData && evt.clipboardData.getData) {
      const imageFiles: File[] = [];
      const images: string[] = [];

      for (const file of evt.clipboardData.files) {
        file.type.startsWith('image/') && imageFiles.push(file);
      }

      await Promise.all(
        imageFiles.map(async (file) => {
          const data = await imageFileToBase64(file);
          images.push(data);
          imageQueue.push({
            fileName: file.name,
            data,
          });
        }),
      );

      if (images.length > 0) {
        const html = images
          .map((value) => `<img src="${value}" style="max-width: 100%" />`)
          .join(' ');
        editortRef.value.runCmd('insertHtml', html);
      } else {
        const text = evt.clipboardData.getData('text/plain');
        editortRef.value.runCmd('insertText', text);
      }
    }
  }

  async function uploadImages(content: string, path: string) {
    await Promise.all(
      imageQueue.map(async (image) => {
        const imageRef = storageRef(storage, `${path}/${uid()}/${image.fileName}`);

        await uploadString(imageRef, image.data, 'data_url');

        const url = await getDownloadURL(imageRef);
        content = content.replace(image.data, url);
      }),
    );

    imageQueue.splice(0);

    return content;
  }

  return {
    editortRef,
    onEditorPaste,
    uploadImages,
  };
}
