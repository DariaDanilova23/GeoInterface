import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
  formGroup: FormGroup;
  selectedFile: File | null = null;
  selectedTab: 'raster' | 'vector' = 'raster';

  // URL для загрузки растровых и векторных слоёв на Geoserver
  private rasterUploadUrl = 'http://localhost:8080/geoserver/rest/workspaces/nurc/coveragestores';
  private vectorUploadUrl = 'http://localhost:8080/geoserver/rest/workspaces/topp/datastores';

  constructor(private fb: FormBuilder, private http: HttpClient, private auth: AuthService) {
    // Создание формы
    this.formGroup = this.fb.group({
      layerName: [''], // Поле для имени слоя
      layerDate: [''], // Поле для даты съёмки (только для вектора)
      file: [null], // Поле для файла
    });
  }


  // Обработка выбора файла
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.formGroup.patchValue({ file: this.selectedFile });
  }

  // Обработка отправки формы
  onSubmit() {
    if (this.formGroup.valid) {
      const layerName = this.formGroup.get('layerName')?.value;

      // Подготовка данных для отправки
      const formData = new FormData();
      formData.append('file', this.selectedFile as Blob);
      formData.append('layerName', layerName);

      if (this.selectedTab === 'vector') {
        const layerDate = this.formGroup.get('layerDate')?.value;
        formData.append('layerDate', layerDate);
        this.uploadVectorLayer(formData, layerName);
      } else {
        this.uploadRasterLayer(formData, layerName);
      }
    }
  }
  createCoveragestores(layerName: string) {
    const createStoreUrl = `http://localhost:8080/geoserver/rest/workspaces/nurc/coveragestores`;
    const body = {
      coverageStore: {
        name: layerName,
        type: 'GeoPackage',
        workspace: 'nurc',
        enabled: true
      }
    };

    this.http.post(createStoreUrl, body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa('admin:geoserver'),
      },
    }).subscribe({
      next: () => {
        console.log('Store успешно создан');
        // Теперь загрузить файл в store
      },
      error: (error) => {
        //?targetName=${layerName}
        console.error('Ошибка создания store', error);
      },
    });
  }

  // Загрузка растрового слоя
  uploadRasterLayer(formData: FormData, layerName: string) {
    this.createCoveragestores(layerName)
    const uploadUrl = `${this.rasterUploadUrl}/${layerName}/file.geopackage (mosaic)`;
    this.http.put(uploadUrl, formData, {
      headers: {
        'Content-Type': 'application/zip',
        Authorization: 'Basic ' + btoa('admin:geoserver'), 
      },
    }).subscribe({
      next: () => {
        console.log('файл успешно загружен');
        alert(' файл успешно загружен');
      },
      error: (error) => {
        console.error('Ошибка загрузки файла', error);
        alert('Ошибка загрузки файла');
      },
    });
  }


  // Загрузка векторного слоя
  uploadVectorLayer(formData: FormData, layerName: string) {
    console.log("vector")
    this.auth.getAccessTokenSilently().subscribe((token) => {
      console.log(token)

      const url = `${this.vectorUploadUrl}/${layerName}/file.shp`;
      console.log(url)
      this.http
        .put(url, formData, {
          headers: {
            'Content-Type': 'application/zip',
            Authorization: 'Basic ' + btoa('admin:geoserver'), 
          },
        })
        .subscribe({
          next: () => {
            console.log('Векторный слой успешно загружен');
            alert('Векторный слой успешно загружен');


          },
          error: (error) => {
            console.error('Ошибка загрузки векторного слоя', error);
            alert('Ошибка загрузки векторного слоя');
          },
        });
    });
  }



  // Переключение вкладок
  switchTab(tab: 'raster' | 'vector') {
    this.selectedTab = tab;
  }

  // Отмена
  onCancel() {
    this.formGroup.reset();
    this.selectedFile = null;
  }

}
