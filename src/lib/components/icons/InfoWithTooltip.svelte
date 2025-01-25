<script lang="ts">
  import { t } from "$lib/translations/translations";
  import { Tooltip } from "flowbite-svelte";
  import IcBaselineInfo from "./IcBaselineInfo.svelte";

  export let id: string;
  export let key_i18n: string;
</script>

<IcBaselineInfo id="{id}" class="text-xl" />
<Tooltip triggeredBy="#{id}">{$t(key_i18n)}</Tooltip>
