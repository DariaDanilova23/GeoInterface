import { Component, Input } from '@angular/core';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Layer } from 'ol/layer';
@Component({
  selector: 'app-layer-list',
  templateUrl: './layer-list.component.html',
  styleUrls: ['./layer-list.component.css']
})
export class LayerListComponent {
  @Input() layers: Array<{ layer: Layer, title: string, layerName:string }> = [];
  
  // Method to toggle the visibility of a layer
  toggleLayerVisibility(layer: Layer) {
    const isVisible = layer.getVisible();
    layer.setVisible(!isVisible);
  }
}
