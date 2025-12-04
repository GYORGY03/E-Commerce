import { useState, useEffect } from 'react';
import { Carousel } from 'primereact/carousel';
import type { CarouselResponsiveOption } from 'primereact/carousel';
import { Tag } from 'primereact/tag';
import { supabase } from '../supabaseClient';
import type { Product } from '../types';

export default function ProductCarousel() {
    const [products, setProducts] = useState<Product[]>([]);
    const responsiveOptions: CarouselResponsiveOption[] = [
        {
            breakpoint: '1400px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '1199px',
            numVisible: 3,
            numScroll: 1
        },
        {
            breakpoint: '767px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '575px',
            numVisible: 1,
            numScroll: 1
        }
    ];

    const getSeverity = (product: Product) => {
        if (product.stock === 0) {
            return 'danger';
        } else if (product.stock < 10) {
            return 'warning';
        }
        return 'success';
    };

    const getStockLabel = (product: Product) => {
        if (product.stock === 0) {
            return 'SIN STOCK';
        } else if (product.stock < 10) {
            return 'POCO STOCK';
        }
        return 'EN STOCK';
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name')
                .limit(9);

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    };

    const productTemplate = (product: Product) => {
        return (
            <div className="m-4 text-center py-5 px-3">
                <div className="mb-3 flex align-items-center justify-content-center" style={{ height: '200px', backgroundColor: '#F3F4F6' }}>
                    {product.image_url ? (
                        <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                                if (sibling) sibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    {!product.image_url && (
                        <i className="pi pi-shopping-bag" style={{ fontSize: '4rem', color: '#9CA3AF' }}></i>
                    )}
                </div>
                <div>
                    <h4 className="mb-1 line-clamp-2" style={{ minHeight: '3rem' }}>{product.name}</h4>
                    <h6 className="mt-0 mb-3" style={{ color: '#4CAF50', fontSize: '1.5rem', fontWeight: 'bold' }}>${product.price.toFixed(2)}</h6>
                    <Tag value={getStockLabel(product)} severity={getSeverity(product)}></Tag>
                    <div className="mt-3">
                        <p className="text-sm" style={{ color: '#6B7280' }}>
                            Stock: <strong>{product.stock}</strong>
                        </p>
                    </div>
                </div>
            </div>
        );
    };
    
    return (
        <div className="card">
            <Carousel value={products} numVisible={3} numScroll={3} responsiveOptions={responsiveOptions} className="custom-carousel" circular
            autoplayInterval={3000} itemTemplate={productTemplate} showIndicators={false} />
        </div>
    )
}
        