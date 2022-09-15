<script>
const base_upload_url = process.env.VUE_APP_UPLOAD_API
const base_excel_upload_url = process.env.VUE_APP_EXCEL_UPLOAD_API
const base_web_url = process.env.VUE_APP_WEB_URL
export default {
  name: 'Global',
  base_upload_url,
  base_excel_upload_url,
  base_web_url
}
</script>
