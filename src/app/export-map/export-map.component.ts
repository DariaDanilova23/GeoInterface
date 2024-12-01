import { Component, Input } from '@angular/core';
import { Map } from 'ol';

@Component({
  selector: 'app-export-map',
  templateUrl: './export-map.component.html',
  styleUrls: ['./export-map.component.css']
})
export class ExportMapComponent {
  @Input() map!: Map; // Получаем объект карты из родительского компонента

  exportMap(): void {
    if (!this.map) {
      console.error('Map is not defined');
      return;
    }

    this.map.once('rendercomplete', () => {
      const size = this.map.getSize();
      if (!size) {
        console.error('Map size is undefined');
        return;
      }

      const mapCanvas = document.createElement('canvas');
      mapCanvas.width = size[0];
      mapCanvas.height = size[1];
      const mapContext = mapCanvas.getContext('2d');

      if (!mapContext) {
        console.error('Failed to get canvas context');
        return;
      }

      // Проходим по всем слоям карты и отрисовываем их на canvas
      Array.prototype.forEach.call(
        this.map.getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-layer'),
        (canvas: HTMLCanvasElement) => {
          if (canvas.width > 0) {
            // Проверяем прозрачность canvas
            const opacity = canvas.style.opacity;
            mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);

            let matrix: number[];
            const transform = canvas.style.transform;
            if (transform) {
              matrix = transform.match(/^matrix\(([^\(]*)\)$/)![1].split(',').map(Number);
            } else {
              matrix = [
                parseFloat(canvas.style.width) / canvas.width,
                0,
                0,
                parseFloat(canvas.style.height) / canvas.height,
                0,
                0
              ];
            }

            // Преобразуем массив matrix в объект DOMMatrix и применяем его
            const domMatrix = new DOMMatrix(matrix);
            mapContext.setTransform(domMatrix);

            // Проверяем и применяем цвет фона canvas
            const backgroundColor = canvas.style.backgroundColor;
            if (backgroundColor) {
              mapContext.fillStyle = backgroundColor;
              mapContext.fillRect(0, 0, canvas.width, canvas.height);
            }
            mapContext.drawImage(canvas, 0, 0);
          }
        }
      );

      // Сбрасываем настройки контекста
      mapContext.globalAlpha = 1;
      mapContext.setTransform(1, 0, 0, 1, 0, 0);

      // Создаем ссылку для скачивания изображения
      const link = document.createElement('a');
      link.download = 'map.png';
      link.href = mapCanvas.toDataURL();
      link.click();
    });

    // Синхронная отрисовка карты
    this.map.renderSync();
  }
}
