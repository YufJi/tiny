const g = global;

export default function getHomePage() {
  const { mpAppJson } = g;

  const { $homepage } = mpAppJson && mpAppJson.app || {};

  return $homepage;
}
