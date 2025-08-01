// Chart.js component registry for tree shaking
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register only the components we need for better tree shaking
let isRegistered = false;

export function registerChartComponents() {
  if (!isRegistered) {
    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      BarElement,
      ArcElement,
      Title,
      Tooltip,
      Legend,
      Filler
    );
    isRegistered = true;
  }
}

// Call on module load
registerChartComponents();