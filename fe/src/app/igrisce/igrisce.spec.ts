import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Igrisce } from './igrisce';

describe('Igrisce', () => {
  let component: Igrisce;
  let fixture: ComponentFixture<Igrisce>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Igrisce]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Igrisce);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
