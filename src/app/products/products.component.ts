import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

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

  ngOnInit(): void {
    this.http.get<any>('http://localhost:8082/products')
      .subscribe((response) => {
        console.log('💾 Datos recibidos del proxy:', response);
        this.productsDutti = response.products ?? response.data ?? [];
      });
  }

  trackByProductId = (index: number, product: any): number => product.id;
}
