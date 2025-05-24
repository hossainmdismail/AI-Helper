import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Assignment Generator',
        href: '/assignment',
    },
];

export default function Dashboard() {
    const [previews, setPreviews] = useState<string[]>([]);
    const { data, setData, post, errors, progress } = useForm({
        files: [] as File[],
        title: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/medias/upload', { // Update your endpoint to handle multiple files
            preserveScroll: true,
            onSuccess: () => {
                setPreviews([]);
            },
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newFiles = Array.from(files);
            setData('files', [...data.files, ...newFiles]);

            // Handle previews with file type check
            const newPreviews: string[] = [];
            newFiles.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const fileType = file.type;

                    // For images or pdf, store as object URL with type prefix
                    if (fileType === 'application/pdf') {
                        newPreviews.push(`pdf:${URL.createObjectURL(file)}`);
                    } else {
                        newPreviews.push(`img:${reader.result}`);
                    }

                    // Once all are processed, update state
                    if (newPreviews.length === newFiles.length) {
                        setPreviews(prev => [...prev, ...newPreviews]);
                    }
                };
                if (file.type === 'application/pdf') {
                    // Don’t need base64 for PDF, use blob URL
                    reader.readAsArrayBuffer(file); // still triggers onloadend
                } else {
                    reader.readAsDataURL(file); // base64 for images
                }
            });
        }
    };


    const removeImage = (index: number) => {
        const updatedFiles = [...data.files];
        updatedFiles.splice(index, 1);
        setData('files', updatedFiles);

        const updatedPreviews = [...previews];
        updatedPreviews.splice(index, 1);
        setPreviews(updatedPreviews);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assignment Generator" />
            <div className="flex h-full flex-1 flex-col gap-4 mt-16 rounded-xl p-4">
                <div className='flex flex-col gap-4 md:flex-row'>
                    <div className='w-9/12 mx-auto'>
                        <h1 className='text-3xl font-bold'>Assignment Generator</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} encType="multipart/form-data" className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="title">
                            Upload Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                        />
                        {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="images">
                            Select Multiple Images
                        </label>
                        <input
                            type="file"
                            id="images"
                            accept="image/*,application/pdf"
                            onChange={handleImageChange}
                            multiple
                            required
                            className="w-full px-3 py-2 border rounded-md"
                        />
                        {errors.files && <div className="text-red-500 text-sm mt-1">{errors.files}</div>}
                    </div>

                    {previews.length > 0 && (
                        <div className="mb-4">
                            <h2 className="text-gray-700 mb-2">
                                Selected Files ({data.files.length}):
                            </h2>
                            <div className="grid grid-cols-3 gap-2">
                                {previews.map((preview, index) => {
                                    const [type, src] = preview.split(':');

                                    return (
                                        <div key={index} className="relative">
                                            {type === 'pdf' ? (
                                                <div className="w-full h-24 bg-gray-100 flex flex-col items-center justify-center rounded-md text-sm text-gray-600 p-2">
                                                    <span>📄 PDF File</span>
                                                    <a
                                                        href={src}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 underline mt-1 text-xs"
                                                    >
                                                        View PDF
                                                    </a>
                                                </div>
                                            ) : (
                                                <img
                                                    src={src}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-md"
                                                />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}


                    {progress && (
                        <div className="mb-4">
                            <progress value={progress.percentage} max="100">
                                {progress.percentage}%
                            </progress>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={data.files.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {data.files.length > 1 ? `Upload ${data.files.length} Files` : 'Upload File'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
