<script lang="ts">
  import { onMount } from 'svelte';
  import InfoWithTooltip from "../icons/InfoWithTooltip.svelte";
  import { subDays, eachDayOfInterval, format, startOfWeek, endOfWeek, getDay, startOfYear } from 'date-fns';

  interface Props {
    data: Record<string, number> | null;
  }
  let { data }: Props = $props();

  const today = new Date();
  const startDate = subDays(today, 365); // Past year
  
  // Ensure we start from Sunday
  const calendarStart = startOfWeek(startDate);
  const calendarEnd = endOfWeek(today);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  function getColor(score: number): string {
    // Red (-0.25) <-> White (0) <-> Green (0.25)
    // Clamp score
    const clamped = Math.max(-0.25, Math.min(0.25, score));
    
    if (clamped < 0) {
      // Red to White
      // -0.25 -> 255, 0, 0
      // 0 -> 255, 255, 255
      // intensity 0 to 1 (0 is white, 1 is red)
      const intensity = Math.abs(clamped) / 0.25;
      const g = Math.round(255 * (1 - intensity));
      const b = Math.round(255 * (1 - intensity));
      return `rgb(255, ${g}, ${b})`;
    } else {
      // White to Green
      // 0 -> 255, 255, 255
      // 0.25 -> 0, 255, 0
      const intensity = clamped / 0.25;
      const r = Math.round(255 * (1 - intensity));
      const b = Math.round(255 * (1 - intensity));
      return `rgb(${r}, 255, ${b})`;
    }
  }

  function getDateKey(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  function getTooltip(date: Date, score: number | undefined): string {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (score === undefined) return `${dateStr}: No data`;
    return `${dateStr}: ${score.toFixed(3)}`;
  }
</script>

{#if data && Object.keys(data).length > 0}
  <div class="p-4 bg-white shadow rounded-lg">
    <div class="flex items-center gap-2 mb-4">
      <h3 class="text-xl font-semibold text-gray-800">Sentiment Calendar</h3>
      <InfoWithTooltip id="sentimentCalendar" key_i18n="stats.sentiment_calendar_info" />
    </div>
    
    <div class="overflow-x-auto">
      <div class="flex flex-col gap-1 min-w-max">
         <!-- Calendar Grid (GitHub style: Rows = Day of Week, Cols = Weeks) -->
         <!-- Note: CSS Grid is easier: grid-rows-7 grid-flow-col -->
         <div class="grid grid-rows-7 grid-flow-col gap-1 h-32">
           {#each days as day}
             {@const dateKey = getDateKey(day)}
             {@const score = data[dateKey]}
             <div
               class="w-3 h-3 rounded-sm border border-gray-100"
               style="background-color: {score !== undefined ? getColor(score) : '#f3f4f6'}"
               title={getTooltip(day, score)}
             ></div>
           {/each}
         </div>
      </div>
      <div class="mt-2 flex justify-end items-center text-xs text-gray-500 gap-2">
         <span>Negative</span>
         <div class="w-3 h-3" style="background-color: rgb(255, 0, 0)"></div>
         <div class="w-3 h-3" style="background-color: rgb(255, 128, 128)"></div>
         <div class="w-3 h-3" style="background-color: rgb(255, 255, 255); border: 1px solid #eee;"></div>
         <div class="w-3 h-3" style="background-color: rgb(128, 255, 128)"></div>
         <div class="w-3 h-3" style="background-color: rgb(0, 255, 0)"></div>
         <span>Positive</span>
      </div>
    </div>
  </div>
{/if}
