'use client';

import React, { useState } from 'react';
import { Gallery, Item } from 'react-photoswipe-gallery';
import 'photoswipe/dist/photoswipe.css';

type ImageViewProps = {
    source: string;
    className?: string;
    alt?: string;
};

type ItemRefCallback = (node: HTMLElement | null) => void;

export default function ImageView(props: ImageViewProps) {
    const { source, className, alt = 'Image' } = props;
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Get image dimensions for PhotoSwipe
    React.useEffect(() => {
        if (source) {
            const img = new Image();
            img.onload = () => {
                setDimensions({
                    width: img.width,
                    height: img.height,
                });
            };
            img.src = source;
        }
    }, [source]);

    return (
        <Gallery>
            <Item
                original={source}
                thumbnail={source}
                width={dimensions.width || 800}
                height={dimensions.height || 600}
                alt={alt}
            >
                {({ ref, open }) => (
                    <img
                        ref={ref as any}
                        onClick={open}
                        src={source}
                        alt={alt}
                        className={className}
                        style={{ cursor: 'pointer' }}
                    />
                )}
            </Item>
        </Gallery>
    );
}
