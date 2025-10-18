import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface FlattenedProduct {
  id: string;
  name: string;
  colorName: string;
  image: string;
  price: number;
  colorId: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  private http = inject(HttpClient);
  productsDutti: any[] = [];
  flattenedProducts: FlattenedProduct[] = [];

  ngOnInit(): void {
    this.http.get<any>('http://localhost:8082/products')
      .subscribe((response) => {
        console.log('💾 Datos recibidos del proxy:', response);
        this.productsDutti = response.products ?? response.data ?? [];
        this.flattenedProducts = this.flattenProducts();
        console.log('📦 Productos aplanados:', this.flattenedProducts);
      });
  }

  flattenProducts(): FlattenedProduct[] {
  const flattened: FlattenedProduct[] = [];
  
  this.productsDutti.forEach(product => {
    const colors = product.bundleProductSummaries?.[0]?.detail?.colors || [];
    const xmedia = product.bundleProductSummaries?.[0]?.detail?.xmedia || [];
    
    colors.forEach((color: any, index: number) => {
      // Intenta obtener la imagen correspondiente al índice del color
      const image = xmedia[index]?.xmediaItems?.[0]?.medias?.[0]?.url 
        || xmedia[0]?.xmediaItems?.[0]?.medias?.[0]?.url
        || 'assets/placeholder.jpg';
      
      flattened.push({
        id: `${product.id}-${color.id}`,
        name: product.name || 'Producto sin nombre',
        colorName: color.name || '',
        colorId: color.id,
        image: image,
        price: color.sizes?.[0]?.price || 0
      });
    });
  });
  
  return flattened;
}

  formatPrice(price: number): string {
    if (!price) return 'Precio no disponible';
    return `${(price / 100).toFixed(2).replace('.', ',')} €`;
  }

  trackByProductId = (index: number, product: FlattenedProduct): string => product.id;
}