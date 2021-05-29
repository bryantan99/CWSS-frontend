export class CkEditorConstants {
  public static EDITOR_URL = "./assets/ckeditor/ckeditor.js";
  public static DEFAULT_CONFIG = {
    toolbarGroups : [
      { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
      { name: 'styles', groups: [ 'styles' ] },
      { name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
      { name: 'forms', groups: [ 'forms' ] },
      { name: 'paragraph', groups: [ 'list', 'paragraph' ] },
      { name: 'links', groups: [ 'links' ] },
      { name: 'tools', groups: [ 'tools' ] },
      { name: 'others', groups: [ 'others' ] },
      { name: 'about', groups: [ 'about' ] }
    ],
    removeButtons: 'Source,Save,NewPage,ExportPdf,Preview,Print,Templates,Font,FontSize,Styles,RemoveFormat,CopyFormatting,Undo,Redo,SelectAll,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,CreateDiv,BidiRtl,BidiLtr,Anchor,Flash,Table,Image,HorizontalRule,PageBreak,Iframe,ShowBlocks'
  }
}
