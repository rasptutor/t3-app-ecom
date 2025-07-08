"use client"

// /admin/products/_components/ProductForm.tsx

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/formatters'
import { api } from '@/trpc/react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

type Product = {
  id: string
  name: string
  description: string
  priceInCents: number
  filePath: string
  imagePath: string
}

export default function ProductForm({ product }: { product?: Product }) {
    const router = useRouter();
    const [name, setName] = useState(product?.name ?? "")
    const [priceInCents, setPriceInCents] = useState<number | undefined>(product?.priceInCents ?? undefined)
    const [description, setDescription] = useState(product?.description ?? "")
    const [file, setFile] = useState<File | null>(null)
    const [image, setImage] = useState<File | null>(null)
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null) 
    
    const utils = api.useUtils()
    const { mutate: createProduct, isPending: creating } = api.product.create.useMutation({
        onSuccess: () => {
        setName("")
        setPriceInCents(0)
        setDescription("")
        setFile(null)
        setImage(null)
        setImagePreviewUrl(null)
        void utils.product.invalidate()
        //router.push("/admin/products");
        },
        onError: (err) => {
        console.error(err.message)
        },
    })

    const { mutate: updateProduct, isPending: updating } =
        api.product.update.useMutation({
        onSuccess: () => {            
            void utils.product.invalidate()
            router.push("/admin/products")
        },
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const form = e.currentTarget as HTMLFormElement
        const formData = new FormData(form)

        const name = formData.get("name") as string
        const description = formData.get("description") as string
        const price = Number(formData.get("priceInCents"))
        const file = formData.get("file") as File
        if (!file) {
        throw new Error("No file selected for upload.");
        }
        const image = formData.get("image") as File

        const fakeUpload = async (file: File, folder: string) => {
            if (!file || !file.name) {
                throw new Error("Uploaded file has no name");
            }
            const formData = new FormData();
            formData.append("file", file);
            console.log("Uploading file:", file.name)

            const res = await fetch(`/api/upload?folder=${folder}`, {
                method: "POST",
                body: formData,
            });

            const text = await res.text(); // always get this
            console.log("Upload response:", text);

            if (!res.ok) {
                //const text = await res.text(); // Capture whatever was returned (if anything)
                throw new Error(`Upload failed (${res.status}): ${text}`);
            }

            let data: any;
            try {
                data = JSON.parse(text);
            } catch (err) {
                throw new Error("Failed to parse upload response as JSON");
            }

            if (!data?.url) {
                throw new Error("Upload response missing 'url' field");
            }

            return data.url as string;
        };

        //const filePath = file ? await fakeUpload(file, "downloads") : product?.filePath ?? "";
        //const imagePath = image ? await fakeUpload(image, "images") : product?.imagePath ?? "";

        let filePath = product?.filePath ?? "";
        if (file && file.name) {
        filePath = await fakeUpload(file, "downloads");
        }

        let imagePath = product?.imagePath ?? "";
        if (image && image.name) {
        imagePath = await fakeUpload(image, "images");
        }

        if (product) {
            updateProduct({
                id: product.id,
                name,
                description,
                priceInCents: price,
                filePath: filePath ?? product.filePath,
                imagePath: imagePath ?? product.imagePath,
            })
            } else {
            createProduct({
                name,
                description,
                priceInCents: price,
                filePath: filePath ?? "/downloads/sample.zip",
                imagePath: imagePath ?? "/images/sample.png",
            })
        }
    }

    return (   
            
        <form className="space-y-6 m-4" onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
                <div className="space-y-2">
                <Label htmlFor="priceInCents">Price In Cents</Label>
                <Input
                type="number"
                id="priceInCents"
                name="priceInCents"
                required
                value={priceInCents?.toString() ?? ""}
                onChange={(e) => {
                const value = e.target.value;
                setPriceInCents(value === "" ? undefined : Number(value));
                }}
                />
                <div className="text-muted-foreground">
                    {formatCurrency((priceInCents || 0) / 100)}
                </div>            
            </div>            
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                id="description"
                name="description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                />            
            </div>
            <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <Input 
                    type="file" id="file" name="file" required={!product} 
                    onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <div className="text-muted-foreground">
                    {product?.filePath && !file && `Current: ${product.filePath}`}
                </div>            
            </div>
            <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <Input 
                    type="file" id="image" name="image" required={!product} 
                    onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        setImage(file)

                        if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                            setImagePreviewUrl(reader.result as string)
                        }
                        reader.readAsDataURL(file)
                        } else {
                        setImagePreviewUrl(null)
                        }
                    }} 
                />
                <div className="text-muted-foreground">
                    {product?.imagePath && !image && `Current: ${product.imagePath}`}
                </div>
                {imagePreviewUrl && (
                    <div className="mt-2">
                        <img
                        src={imagePreviewUrl}
                        alt="Preview"
                        className="h-32 object-contain border rounded"
                        />
                    </div>
                )}            
            </div>
            <Button 
                type="submit"
                className="bg-black text-white px-4 py-4 rounded hover:bg-gray-800 transition" 
                disabled={creating || updating}>
                {product ? (updating ? "Updating..." : "Update Product") : creating ? "Creating..." : "Submit Product"}
            </Button>            
        </form>    
    )
}