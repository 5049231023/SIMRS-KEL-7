<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Arr;

class FhirRepository
{
    protected string $basePath;

    public function __construct()
    {
        $this->basePath = storage_path('fhir');
        if (!File::exists($this->basePath)) {
            File::makeDirectory($this->basePath, 0755, true);
        }
    }

    protected function getCollectionPath(string $collection): string
    {
        $path = $this->basePath . DIRECTORY_SEPARATOR . $collection;
        if (!File::exists($path)) {
            File::makeDirectory($path, 0755, true);
        }
        return $path;
    }

    public function all(string $collection): array
    {
        $path = $this->getCollectionPath($collection);
        $files = File::files($path);
        
        $docs = [];
        foreach ($files as $file) {
            if ($file->getExtension() === 'json') {
                $docs[] = json_decode(File::get($file->getPathname()), true);
            }
        }
        return $docs;
    }

    public function find(string $collection, string $id): ?array
    {
        $path = $this->getCollectionPath($collection) . DIRECTORY_SEPARATOR . $id . '.json';
        if (File::exists($path)) {
            return json_decode(File::get($path), true);
        }
        return null;
    }

    public function findBy(string $collection, string $field, string $value): ?array
    {
        $docs = $this->all($collection);
        foreach ($docs as $doc) {
            $currentValue = Arr::get($doc, $field);
            if ($currentValue === $value) {
                return $doc;
            }
        }
        return null;
    }

    public function query(string $collection, callable $filter): array
    {
        $docs = $this->all($collection);
        return array_values(array_filter($docs, $filter));
    }

    public function save(string $collection, string $id, array $data): void
    {
        $path = $this->getCollectionPath($collection) . DIRECTORY_SEPARATOR . $id . '.json';
        File::put($path, json_encode($data, JSON_PRETTY_PRINT));
    }

    public function delete(string $collection, string $id): void
    {
        $path = $this->getCollectionPath($collection) . DIRECTORY_SEPARATOR . $id . '.json';
        if (File::exists($path)) {
            File::delete($path);
        }
    }
}
