import { Component, ViewChild } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ MatMenuModule, MatIconModule ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  toggleMenu() {
    const menu = document.getElementById('menu');
    if (menu) {
      menu.classList.toggle('open');
    }
  }
}
