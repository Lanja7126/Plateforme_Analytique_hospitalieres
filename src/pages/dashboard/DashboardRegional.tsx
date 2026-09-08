import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";

import type { Layer } from "leaflet";

import "leaflet/dist/leaflet.css";

import { getRegions } from "../../api/stats.api";

import {
  COULEURS_CATEGORIES,
  CENTRE_MADAGASCAR,
  MAPPING_REGIONS_GEOJSON,
} from "../../constants/dashboard.constants";

import madagascarRegions from "../../assets/gadm41_MDG_2.json";

type Tri = "igph" | "risque" | "nom";

export default function DashboardRegional() {
  const { data: regions, isLoading } = useQuery({
    queryKey: ["regions"],
    queryFn: () => getRegions(),
  });

  const [tri, setTri] = useState<Tri>("igph");

  const classement = useMemo(() => {
    const liste = [...(regions ?? [])];

    if (tri === "igph") {
      liste.sort((a, b) => b.igphMoyen - a.igphMoyen);
    }

    if (tri === "risque") {
      liste.sort((a, b) => b.pctHautRisque - a.pctHautRisque);
    }

    if (tri === "nom") {
      liste.sort((a, b) => a.region.localeCompare(b.region));
    }

    return liste;
  }, [regions, tri]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!regions || regions.length === 0) {
    return (
      <div className="alert">
        <span>
          Aucune donnée régionale pour l'instant — importe un CSV pour
          commencer.
        </span>
      </div>
    );
  }

  const getRegionData = (nomGeoJson: string) => {
    return regions.find(
      (r) => MAPPING_REGIONS_GEOJSON[r.region] === nomGeoJson,
    );
  };

  const styleRegion = (feature: any) => {
    const nomRegion = feature?.properties?.NAME_2;

    const regionData = getRegionData(nomRegion);

    const couleur =
      COULEURS_CATEGORIES[regionData?.categorieDominante ?? ""] ?? "#CBD5E1";

    return {
      fillColor: couleur,

      fillOpacity: 0.75,

      color: "#FFFFFF",

      weight: 1.2,
    };
  };

  const onEachRegion = (feature: any, layer: Layer) => {
    const nomRegion = feature?.properties?.NAME_2;

    const regionData = getRegionData(nomRegion);
    if (regionData) {
      layer.bindPopup(`
        
        <div style="
          min-width: 220px;
          font-family: sans-serif;
        ">

          <div style="
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 8px;
          ">
            ${regionData.region}
          </div>

          <div style="margin-bottom: 4px;">
            <strong>Établissements :</strong>
            ${regionData.nbHopitaux}
          </div>

          <div style="margin-bottom: 4px;">
            <strong>IGPH moyen :</strong>
            ${regionData.igphMoyen.toFixed(3)}
          </div>

          <div style="margin-bottom: 4px;">
            <strong>Haut risque :</strong>
            ${(regionData.pctHautRisque * 100).toFixed(1)} %
          </div>

          <div>
            <strong>Catégorie :</strong>
            ${regionData.categorieDominante ?? "—"}
          </div>

        </div>

      `);
    } else {
      layer.bindPopup(`

        <div>

          <strong>
            ${nomRegion}
          </strong>

          <br />

          Aucune donnée disponible.

        </div>

      `);
    }

    layer.on({
      mouseover: (event: any) => {
        const target = event.target;

        target.setStyle({
          weight: 2.5,

          fillOpacity: 0.95,
        });

        if (typeof target.bringToFront === "function") {
          target.bringToFront();
        }
      },

      mouseout: (event: any) => {
        const target = event.target;

        target.setStyle(styleRegion(feature));
      },
    });
  };

  return (
    <div className="space-y-6">
      {}
      <div>
        <h1 className="text-2xl font-bold">Dashboard régional</h1>

        <p className="text-base-content/60">
          Carte de Madagascar et classement des 23 régions.
        </p>
      </div>

      {}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-base-300
        "
      >
        <MapContainer
          center={CENTRE_MADAGASCAR}
          zoom={5.3}
          minZoom={5}
          maxZoom={8}
          scrollWheelZoom={true}
          style={{
            height: "520px",
            width: "100%",
          }}
        >
          {}

          <TileLayer
            attribution="
              &copy; OpenStreetMap contributors
            "
            url="
              https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
            "
          />

          {}

          <GeoJSON
            data={madagascarRegions as any}
            style={styleRegion}
            onEachFeature={onEachRegion}
          />
        </MapContainer>
      </div>

      {}

      <p className="text-xs text-base-content/50">
        Couleur = catégorie de performance dominante issue du modèle K-Means.
        Cliquez sur une région pour afficher ses indicateurs.
      </p>

      {}

      <div
        className="
          flex
          flex-wrap
          gap-4
          rounded-xl
          border
          border-base-300
          p-4
        "
      >
        <span className="font-semibold">Légende :</span>

        {Object.entries(COULEURS_CATEGORIES).map(([categorie, couleur]) => (
          <div
            key={categorie}
            className="
                flex
                items-center
                gap-2
              "
          >
            <span
              className="
                  h-4
                  w-4
                  rounded-sm
                "
              style={{
                backgroundColor: couleur,
              }}
            />

            <span className="text-sm">{categorie}</span>
          </div>
        ))}
      </div>

      {}

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-3
        "
      >
        <span className="text-sm font-medium">Trier par :</span>

        <div className="join">
          <button
            className={`
              btn
              btn-sm
              join-item
              ${tri === "igph" ? "btn-active" : ""}
            `}
            onClick={() => setTri("igph")}
          >
            IGPH
          </button>

          <button
            className={`
              btn
              btn-sm
              join-item
              ${tri === "risque" ? "btn-active" : ""}
            `}
            onClick={() => setTri("risque")}
          >
            % haut risque
          </button>

          <button
            className={`
              btn
              btn-sm
              join-item
              ${tri === "nom" ? "btn-active" : ""}
            `}
            onClick={() => setTri("nom")}
          >
            Nom
          </button>
        </div>
      </div>

      {}

      <div
        className="
          overflow-x-auto
          rounded-xl
          border
          border-base-300
        "
      >
        <table className="table">
          <thead>
            <tr>
              <th>Région</th>

              <th>Catégorie dominante</th>

              <th>Établissements</th>

              <th>IGPH moyen</th>

              <th>% haut risque</th>

              <th>Mortalité moyenne</th>
            </tr>
          </thead>

          <tbody>
            {classement.map((r) => (
              <tr key={r.region}>
                <td className="font-medium">{r.region}</td>

                <td>
                  {r.categorieDominante && (
                    <span
                      className="
                          badge
                          badge-outline
                        "
                      style={{
                        color: COULEURS_CATEGORIES[r.categorieDominante],

                        borderColor: COULEURS_CATEGORIES[r.categorieDominante],
                      }}
                    >
                      {r.categorieDominante}
                    </span>
                  )}
                </td>

                <td>{r.nbHopitaux}</td>

                <td>{r.igphMoyen.toFixed(3)}</td>

                <td>{(r.pctHautRisque * 100).toFixed(1)} %</td>

                <td>{r.tauxMortaliteMoyen.toFixed(2)} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
