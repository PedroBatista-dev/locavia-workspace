import { FormGroup, AbstractControl } from '@angular/forms';

export function generateMessageValidator(formGroups: { title: string; form: FormGroup }[], controlLabels: { [key: string]: string }, form?: FormGroup,): any {

  if(form){
    const invalidControls = findInvalidControls(form);

    return Object.keys(invalidControls).map(fieldName => {
      const control = form.get(fieldName);
      const label = controlLabels[fieldName] || fieldName;
  
      return { control, label };
    });
  } else {
    return formGroups.map(({ title, form }) => {
      const invalidControls: { control: AbstractControl, label: string }[] = [];
  
      Object.keys(form.controls).forEach(field => {
        const control = form.get(field);
  
        if (control && (control!.invalid || control!.pending)) {
          const label = controlLabels[field] || field;
          invalidControls.push({ control, label });
        }
      });
  
      return { title, controls: invalidControls };
    });
  }

}

function findInvalidControls(formGroup: FormGroup): { [key: string]: AbstractControl[] } {
  const invalidControls: { [key: string]: AbstractControl[] } = {};

  Object.keys(formGroup.controls).forEach(field => {
    const control = formGroup.get(field);

    if (control!.invalid || control!.pending) {
      if (!invalidControls[field]) {
        invalidControls[field] = [];
      }

      invalidControls[field].push(control!);
    }
  });

  return invalidControls;
}